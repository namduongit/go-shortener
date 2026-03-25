package handler

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"url-shortener/internal/config"
	"url-shortener/internal/model"
	"url-shortener/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func GetFiles(c *gin.Context) {
	userID := c.GetUint("uid")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, config.GinErrorResponse(
			[]string{"User not exists"},
			config.RestFulNotFound,
			config.RestFulCodeInvalid,
		))
		return
	}

	files, err := service.GetFilesByUserID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			[]string{"Cannot fetch files"},
			config.RestFulInternalError,
			config.RestFulCodeInternalError,
		))
		return
	}

	cfg := config.GetConfig()
	filePayload := make([]map[string]any, len(files))
	for i, file := range files {
		filePayload[i] = map[string]any{
			"name":        file.FileName,
			"storedName":  file.StoredName,
			"size":        file.Size,
			"uploadedAt":  file.UploadedAt,
			"downloadUrl": fmt.Sprintf("%s:%s/api/files/%s", cfg.HOST, cfg.PORT, file.StoredName),
		}
	}

	c.JSON(http.StatusOK, config.GinResponse(
		map[string]any{
			"accountID": userID,
			"files":     filePayload,
		},
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))
}

func UploadFile(c *gin.Context) {
	userID := c.GetUint("uid")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, config.GinErrorResponse(
			[]string{"User not exists"},
			config.RestFulUnauthorized,
			config.RestFulCodeUnauthorized,
		))
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			[]string{"File not found"},
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	var user model.User
	if err := config.DB.Preload("Plan").First(&user, userID).Error; err != nil {
		status := http.StatusInternalServerError
		message := config.RestFulInternalError
		code := config.RestFulCodeInternalError
		if errors.Is(err, gorm.ErrRecordNotFound) {
			status = http.StatusNotFound
			message = config.RestFulNotFound
			code = config.RestFulCodeNotFound
		}
		c.JSON(status, config.GinErrorResponse(
			[]string{"User not exists"},
			message,
			code,
		))
		return
	}

	totalSize, err := service.GetUserStorageUsage(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			[]string{"Cannot calculate storage usage"},
			config.RestFulInternalError,
			config.RestFulCodeInternalError,
		))
		return
	}

	if totalSize+file.Size > user.Plan.StorageLimit {
		c.JSON(http.StatusForbidden, config.GinErrorResponse(
			[]string{"Storage limit exceeded"},
			config.RestFulForbidden,
			config.RestFulCodeForbidden,
		))
		return
	}

	storedName := uuid.New().String() + filepath.Ext(file.Filename)
	saveDir := "storage"
	if err := os.MkdirAll(saveDir, 0o755); err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			[]string{"Cannot prepare storage"},
			config.RestFulInternalError,
			config.RestFulCodeInternalError,
		))
		return
	}
	savePath := filepath.Join(saveDir, storedName)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			[]string{"Cannot save file"},
			config.RestFulInternalError,
			config.RestFulCodeInternalError,
		))
		return
	}

	newFile := &model.File{
		FileName:   file.Filename,
		StoredName: storedName,
		FilePath:   savePath,
		Size:       file.Size,
		UserID:     userID,
	}

	if err := service.SaveFileMetadata(newFile); err != nil {
		_ = os.Remove(savePath)
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			[]string{"Cannot save metadata"},
			config.RestFulInternalError,
			config.RestFulCodeInternalError,
		))
		return
	}

	cfg := config.GetConfig()
	fileURL := fmt.Sprintf("%s:%s/api/files/%s", cfg.HOST, cfg.PORT, storedName)

	c.JSON(http.StatusOK, config.GinResponse(
		map[string]any{
			"file": map[string]any{
				"name":        newFile.FileName,
				"storedName":  newFile.StoredName,
				"size":        newFile.Size,
				"uploadedAt":  newFile.CreatedAt,
				"downloadUrl": fileURL,
			},
		},
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))
}

func GetFile(c *gin.Context) {
	userID := c.GetUint("uid")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, config.GinErrorResponse(
			[]string{"User not exists"},
			config.RestFulUnauthorized,
			config.RestFulCodeUnauthorized,
		))
		return
	}
	filename := c.Param("filename")
	if filename == "" {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			[]string{"Missing filename"},
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	fileRecord, err := service.GetFileForUser(userID, filename)
	if err != nil {
		status := http.StatusInternalServerError
		message := config.RestFulInternalError
		code := config.RestFulCodeInternalError
		if errors.Is(err, gorm.ErrRecordNotFound) {
			status = http.StatusNotFound
			message = config.RestFulNotFound
			code = config.RestFulCodeNotFound
		}
		c.JSON(status, config.GinErrorResponse(
			[]string{"File not found"},
			message,
			code,
		))
		return
	}

	if _, err := os.Stat(fileRecord.FilePath); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			c.JSON(http.StatusNotFound, config.GinErrorResponse(
				[]string{"File not found"},
				config.RestFulNotFound,
				config.RestFulCodeNotFound,
			))
			return
		}
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			[]string{"Cannot access file"},
			config.RestFulInternalError,
			config.RestFulCodeInternalError,
		))
		return
	}

	c.File(fileRecord.FilePath)
}

func DeleteFile(c *gin.Context) {
	userID := c.GetUint("uid")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, config.GinErrorResponse(
			[]string{"User not exists"},
			config.RestFulUnauthorized,
			config.RestFulCodeUnauthorized,
		))
		return
	}
	filename := c.Param("filename")
	if filename == "" {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			[]string{"Missing filename"},
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	fileRecord, err := service.GetFileForUser(userID, filename)
	if err != nil {
		status := http.StatusInternalServerError
		message := config.RestFulInternalError
		code := config.RestFulCodeInternalError
		if errors.Is(err, gorm.ErrRecordNotFound) {
			status = http.StatusNotFound
			message = config.RestFulNotFound
			code = config.RestFulCodeNotFound
		}
		c.JSON(status, config.GinErrorResponse(
			[]string{"File not found"},
			message,
			code,
		))
		return
	}

	if err := service.DeleteFileForUser(userID, filename); err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			[]string{"Cannot delete file"},
			config.RestFulInternalError,
			config.RestFulCodeInternalError,
		))
		return
	}

	if err := os.Remove(fileRecord.FilePath); err != nil && !errors.Is(err, os.ErrNotExist) {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			[]string{"Cannot remove file from disk"},
			config.RestFulInternalError,
			config.RestFulCodeInternalError,
		))
		return
	}

	c.Status(http.StatusNoContent)
}
