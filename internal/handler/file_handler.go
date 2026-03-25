package handler

import (
	"net/http"
	"os"
	"path/filepath"
	"url-shortener/internal/config"
	"url-shortener/internal/model"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func UploadFile(c *gin.Context) {
	userID := c.GetUint("user_id")

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file not found"})
		return
	}

	var user model.User
	config.DB.Preload("Plan").First(&user, userID)

	var totalSize int64
	config.DB.Model(&model.File{}).
		Where("user_id = ?", userID).
		Select("COALESCE(SUM(size),0)").
		Scan(&totalSize)

	if totalSize+file.Size > user.Plan.StorageLimit {
		c.JSON(http.StatusForbidden, gin.H{"error": "storage limit exceeded"})
		return
	}

	filename := uuid.New().String() + filepath.Ext(file.Filename)
	savePath := "./storage/" + filename

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot save"})
		return
	}

	f := model.File{
		FileName: file.Filename,
		FilePath: savePath,
		Size:     file.Size,
		UserID:   userID,
	}

	config.DB.Create(&f)

	c.JSON(http.StatusOK, gin.H{
		"file_url": "http://localhost:8080/files/" + filename,
	})
}

func GetFile(c *gin.Context) {
	filename := c.Param("filename")

	filePath := "../../storage/" + filename

	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "file not found"})
		return
	}

	c.File(filePath)
}
