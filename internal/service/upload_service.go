package service

import (
	"context"
	"errors"
	"time"
	"url-shortener/internal/config"
	"url-shortener/internal/http/request"
	"url-shortener/internal/http/response"
	"url-shortener/internal/model"
	"url-shortener/internal/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func BatchInit(c *gin.Context, accountID uint, files []request.MetadataFile, folderUUID string) (*[]response.PresignUploadResponse, error) {
	folder, err := GetFolderByUUID(folderUUID)
	if folderUUID != "" && err != nil {
		return nil, errors.New("Destination not found")
	}
	plans := make([]response.PresignUploadResponse, 0, len(files))

	err = config.PostgresClient.Transaction(func(tx *gorm.DB) error {
		var usage model.AccountUsage
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
			Where("account_id = ?", accountID).
			First(&usage).Error; err != nil {
			return err
		}

		available := safeSub(usage.QuotaBytes, usage.UsedStorage+usage.ReservedBytes)

		for _, file := range files {
			p := response.PresignUploadResponse{
				ClientFileID: file.ClientFileID,
				Accepted:     false,
				FileName:     file.Name,
			}

			// Check conflict by BuildFinalKey - the storage_key is the source of truth
			// for a file's unique location (accountID + folderID + fileName)
			finalKey := utils.BuildFinalKey(accountID, file.Name, folder)
			var existingFile model.File
			existingErr := tx.Where("storage_key = ?", finalKey).First(&existingFile).Error
			hasConflict := existingErr == nil // file with same key already exists

			if hasConflict {
				if file.ConflictStrategy == "" {
					// No strategy provided → signal conflict back to client
					p.Reason = "conflict"
					plans = append(plans, p)
					continue
				}
				if file.ConflictStrategy == request.ConflictStrategyKeep {
					// Skip upload, keep existing
					p.Reason = "skipped"
					plans = append(plans, p)
					continue
				}
				if file.ConflictStrategy == request.ConflictStrategyOverwrite {
					// Delete old file from S3 and DB
					go func(storageKey string) {
						_ = config.DeleteObject(context.Background(), config.GetFinalBucketName(), storageKey)
					}(existingFile.StorageKey)

					if err := tx.Unscoped().Delete(&existingFile).Error; err != nil {
						p.Reason = "Failed to delete existing file: " + err.Error()
						plans = append(plans, p)
						continue
					}
					// Update account usage: subtract old file size
					if err := tx.Model(&model.AccountUsage{}).
						Where("account_id = ?", accountID).
						Update("used_storage", gorm.Expr("GREATEST(used_storage - ?, 0)", existingFile.Size)).Error; err != nil {
						p.Reason = "Failed to update storage usage: " + err.Error()
						plans = append(plans, p)
						continue
					}
					// Recalculate available after deletion
					available += existingFile.Size
				}
			}

			if available < file.Size {
				p.Reason = "Not enough storage available"
				plans = append(plans, p)
				continue
			}

			available -= file.Size
			usage.ReservedBytes += file.Size

			mode := "single"
			var sizePart uint64 = 100 * 1024 * 1024
			if file.Size > 100*1024*1024 {
				mode = "multipart"

				if file.Size > 10*1024*1024*1024 { // 10GB
					sizePart = 64 * 1024 * 1024 // 128MB
				}

				if file.Size > 5*1024*1024*1024 { // 5GB
					sizePart = 64 * 1024 * 1024 // 64MB
				}

				if file.Size > 1*1024*1024*1024 { // 1GB
					sizePart = 32 * 1024 * 1024 // 32MB
				}

				if file.Size > 500*1024*1024 { // 500MB
					sizePart = 24 * 1024 * 1024 // 24MB
				}
			}

			session := model.Session{
				AccountID:   accountID,
				FileName:    file.Name,
				ContentType: file.ContentType,
				TotalSize:   file.Size,
				UploadType:  model.UploadType(mode), // single or multipart

				ObjectKeyTmp:   utils.BuildTmpKey(accountID, file.Name, folder),
				ObjectKeyFinal: utils.BuildFinalKey(accountID, file.Name, folder),

				Status:        model.SessionInProgress,
				ReservedBytes: file.Size,
				ExpiresAt:     time.Now().Add(30 * time.Minute),
			}

			if folder != nil {
				session.FolderID = &folder.ID
			}

			if mode == "multipart" {
				uploadID, err := config.CreateMultipart(c.Request.Context(), session.ObjectKeyTmp, file.ContentType)
				if err != nil {
					usage.ReservedBytes -= file.Size
					available += file.Size
					p.Reason = "Failed to initialize multipart upload" + err.Error()
					plans = append(plans, p)
					continue
				}
				session.S3UploadID = &uploadID
			}

			if err := tx.Create(&session).Error; err != nil {
				usage.ReservedBytes -= file.Size
				available += file.Size
				p.Reason = "Failed to create upload session" + err.Error()
				plans = append(plans, p)
				continue
			}

			p.Accepted = true
			p.SessionUUID = session.UUID.String()
			p.Mode = mode
			p.ExpiresAt = session.ExpiresAt
			if mode == "multipart" {
				p.PartSize = sizePart
			}
			plans = append(plans, p)

			// Set upload session to redis
			if err := SetUploadSession(c.Request.Context(), session.UUID.String(), session); err != nil {
				return err
			}
		}

		return tx.Save(&usage).Error
	})

	return &plans, err
}

func safeSub(a, b uint64) uint64 {
	if a < b {
		return 0
	}
	return a - b
}

func SignURLUpload(c *gin.Context, uuid string, request request.SignUploadRequest) ([]string, error) {
	// var session model.Session
	// if err := config.PostgresClient.Where("uuid = ?", uuid).First(&session).Error; err != nil {
	// 	return []string{}, err
	// }

	// if time.Now().After(session.ExpiresAt) {
	// 	return []string{}, errors.New("Session has expired")
	// }

	// Use Redis to get session
	session, err := GetUploadSession(c.Request.Context(), uuid)
	if err != nil {
		// Cron job will delete expired sessions
		return nil, errors.New("Session not found")
	}

	// Single upload
	if session.UploadType == model.SingleUpload {
		out, err := config.PresignSingleUpload(c.Request.Context(), session.ObjectKeyFinal)
		if err != nil {
			return nil, err
		}

		return []string{
			out,
		}, nil
	}

	// Multipart upload
	if session.UploadType == model.MultipartUpload {
		if session.S3UploadID == nil {
			return []string{}, errors.New("Multipart upload not initialized")
		}

		if request.IsMulti == nil || len(request.Parts) <= 0 {
			return []string{}, errors.New("Invalid part number")
		}

		var outs []string = make([]string, 0, len(request.Parts))
		for _, part := range request.Parts {
			out, _ := config.PresignMultipartUpload(
				c.Request.Context(),
				session.ObjectKeyTmp,
				*session.S3UploadID,
				part,
			)
			outs = append(outs, out)
		}
		return outs, nil
	}

	return []string{}, errors.New("Invalid upload type")
}

func CompleteSingleUpload(c *gin.Context, uuid string) (*model.File, error) {
	var session model.Session
	if err := config.PostgresClient.Where("uuid = ?", uuid).First(&session).Error; err != nil {
		return nil, err
	}

	if session.UploadType != model.SingleUpload {
		return nil, errors.New("Incorrect upload type")
	}

	file := model.File{
		FileName:    session.FileName,
		ContentType: session.ContentType,
		StorageKey:  session.ObjectKeyFinal,
		Size:        session.TotalSize,
		AccountID:   session.AccountID,
		FolderID:    session.FolderID,
	}

	if err := config.PostgresClient.Create(&file).Error; err != nil {
		return nil, err
	}

	// Preload Folder on the newly created file (not on Session)
	if file.FolderID != nil {
		config.PostgresClient.Preload("Folder").First(&file, file.ID)
	}

	session.Status = model.SessionCompleted
	session.ReservedBytes = 0

	// Update folder metadata
	if session.FolderID != nil {
		go updateFolderMetadata(session.FolderID)
	}

	// Update account usage: transfer from ReservedBytes to UsedStorage
	if err := config.PostgresClient.Model(&model.AccountUsage{}).
		Where("account_id = ?", session.AccountID).
		Updates(map[string]interface{}{
			"reserved_bytes": gorm.Expr("GREATEST(reserved_bytes - ?, 0)", session.TotalSize),
			"used_storage":   gorm.Expr("used_storage + ?", session.TotalSize),
		}).Error; err != nil {
		return nil, err
	}

	if err := config.PostgresClient.Save(&session).Error; err != nil {
		return nil, err
	}

	return &file, nil
}

func CompleteMultipartUpload(c *gin.Context, uuid string, request request.CompleteMultipartUploadRequest) (*model.File, error) {
	var session model.Session
	if err := config.PostgresClient.Where("uuid = ?", uuid).First(&session).Error; err != nil {
		return nil, err
	}

	if session.UploadType != model.MultipartUpload {
		return nil, errors.New("Incorrect upload type")
	}

	if session.UploadType == model.MultipartUpload && session.S3UploadID == nil {
		return nil, errors.New("Multipart upload not initialized")
	}

	var completedParts []config.CompletePart
	for _, part := range request.PartCompletes {
		completedParts = append(completedParts, config.CompletePart{
			ETag:       part.ETag,
			PartNumber: int32(part.PartNumber),
		})
	}

	// Complete multipart upload in tmp bucket, then move to final bucket
	err := config.CompleteMultipart(c.Request.Context(), session.ObjectKeyTmp, session.ObjectKeyFinal, *session.S3UploadID, completedParts)
	if err != nil {
		return nil, err
	}

	// Create a row in file schema
	file := model.File{
		FileName:    session.FileName,
		ContentType: session.ContentType,
		StorageKey:  session.ObjectKeyFinal,
		Size:        session.TotalSize,
		AccountID:   session.AccountID,
		FolderID:    session.FolderID,
	}

	if err := config.PostgresClient.Create(&file).Error; err != nil {
		return nil, err
	}

	// Preload Folder on the newly created file (not on Session)
	if file.FolderID != nil {
		config.PostgresClient.Preload("Folder").First(&file, file.ID)
	}

	session.Status = model.SessionCompleted
	session.ReservedBytes = 0

	// Save Parts async
	go savePart(session.ID, request.PartCompletes)

	// Update folder metadata async
	if session.FolderID != nil {
		go updateFolderMetadata(session.FolderID)
	}

	// Update account usage: transfer from ReservedBytes to UsedStorage
	if err := config.PostgresClient.Model(&model.AccountUsage{}).
		Where("account_id = ?", session.AccountID).
		Updates(map[string]interface{}{
			"reserved_bytes": gorm.Expr("GREATEST(reserved_bytes - ?, 0)", session.TotalSize),
			"used_storage":   gorm.Expr("used_storage + ?", session.TotalSize),
		}).Error; err != nil {
		return nil, err
	}

	if err := config.PostgresClient.Save(&session).Error; err != nil {
		return nil, err
	}

	return &file, nil
}

func savePart(sessionID uint, parts []request.PartComplete) {
	for _, part := range parts {
		config.PostgresClient.Create(&model.Part{
			SessionID:  sessionID,
			PartNumber: part.PartNumber,
			ETag:       part.ETag,
			SizeBytes:  part.SizeBytes,
		})
	}
}

func updateFolderMetadata(folderID *uint) {
	if folderID == nil {
		return
	}

	var totalSize uint64
	var totalFile int64

	// Count total files and sum their sizes in the folder
	err := config.PostgresClient.Model(&model.File{}).
		Where("folder_id = ?", *folderID).
		Count(&totalFile).
		Select("COALESCE(SUM(size),0)").
		Row().
		Scan(&totalSize)
	if err != nil {
		return
	}

	// Update folder metadata
	config.PostgresClient.Model(&model.Folder{}).
		Where("id = ?", *folderID).
		Updates(map[string]interface{}{
			"total_file": totalFile,
			"total_size": totalSize,
		})
}
