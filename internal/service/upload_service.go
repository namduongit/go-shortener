package service

import (
	"errors"
	"log"
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

func BatchInit(c *gin.Context, accountID uint, files []request.MetadataFile, folderID *string) ([]response.PresignUploadResponse, error) {
	plans := make([]response.PresignUploadResponse, 0, len(files))

	err := config.PostgresClient.Transaction(func(tx *gorm.DB) error {
		var usage model.AccountUsage
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
			Where("account_id = ?", accountID).
			First(&usage).Error; err != nil {
			return err
		}

		available := safeSub(usage.QuotaBytes, usage.UsedStorage+usage.ReservedBytes)
		log.Printf("Usage store: %d", available)

		for _, file := range files {
			p := response.PresignUploadResponse{
				ClientFileID: file.ClientFileID,
				Accepted:     false,
			}

			// v := request.MetadataFile{
			// 	ClientFileID: file.ClientFileID,
			// 	Name:         file.Name,
			// 	Size:         file.Size,
			// 	ContentType:  file.ContentType,
			// }

			// if err := libs.WithBind(c, &v); err != nil {
			// 	log.Printf("Failed to bind file metadata: %v", err.Error())
			// 	p.Reason = err.Error()
			// 	plans = append(plans, p)
			// 	continue
			// }

			if file.Size == 0 {
				p.Reason = "File size must be greater than 0"
				plans = append(plans, p)
				continue
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
				AccountID:      accountID,
				FileName:       file.Name,
				ContentType:    file.ContentType,
				TotalSize:      file.Size,
				UploadType:     model.UploadType(mode), // single or multipart
				ObjectKeyTmp:   utils.BuildTmpKey(accountID, file.Name, folderID),
				ObjectKeyFinal: utils.BuildFinalKey(accountID, file.Name, folderID),
				Status:         model.SessionInProgress,
				ReservedBytes:  file.Size,
				ExpiresAt:      time.Now().Add(30 * time.Minute),
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
		}

		return tx.Save(&usage).Error
	})

	return plans, err
}

func safeSub(a, b uint64) uint64 {
	if a < b {
		return 0
	}
	return a - b
}

func SignURLUpload(c *gin.Context, uuid string, partNumber *int32) (string, error) {
	var session model.Session
	if err := config.PostgresClient.Where("uuid = ?", uuid).First(&session).Error; err != nil {
		return "", err
	}

	if time.Now().After(session.ExpiresAt) {
		return "", errors.New("Session has expired")
	}

	if session.UploadType == model.SingleUpload {
		out, err := config.PresignSingleUpload(c.Request.Context(), session.ObjectKeyTmp)
		if err != nil {
			return "", err
		}
		return out, nil
	}

	if session.UploadType == model.MultipartUpload {
		if session.S3UploadID == nil {
			return "", errors.New("Multipart upload not initialized")
		}
		if partNumber == nil || *partNumber <= 0 {
			return "", errors.New("Invalid part number")
		}
		out, err := config.PresignMultipartUpload(c.Request.Context(), session.ObjectKeyTmp, *session.S3UploadID, *partNumber)
		if err != nil {
			return "", err
		}
		return out, nil
	}

	return "", errors.New("Invalid upload type")
}

func UploadPart(uuid string, partNumber int32, etag string, sizeBytes uint64) error {
	var session model.Session
	if err := config.PostgresClient.Where("uuid = ?", uuid).First(&session).Error; err != nil {
		return err
	}

	part := model.Part{
		PartNumber: partNumber,
		SessionID:  session.ID,
		ETag:       etag,
		SizeBytes:  sizeBytes,
	}

	return config.PostgresClient.Save(&part).Error
}

func CompleteUpload(c *gin.Context, uuid string) error {
	var session model.Session
	if err := config.PostgresClient.Where("uuid = ?", uuid).First(&session).Error; err != nil {
		return err
	}

	if session.S3UploadID == nil {
		return errors.New("Multipart upload not initialized")
	}

	var parts []model.Part
	if err := config.PostgresClient.Where("session_id = ?", session.ID).Find(&parts).Error; err != nil {
		return err
	}

	var completedParts []config.CompletePart
	for _, part := range parts {
		completedParts = append(completedParts, config.CompletePart{
			ETag:       part.ETag,
			PartNumber: int32(part.PartNumber),
		})
	}

	err := config.CompleteMultipart(c.Request.Context(), session.ObjectKeyFinal, *session.S3UploadID, completedParts)
	if err != nil {
		return err
	}

	session.Status = model.SessionCompleted
	session.ReservedBytes = 0

	return config.PostgresClient.Save(&session).Error
}
