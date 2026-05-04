package handler

import (
	"context"
	"io"
	"net/http"
	"url-shortener/internal/config"
	"url-shortener/internal/model"

	"github.com/aws/aws-sdk-go-v2/aws"
	s3 "github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
)

// ShowImage streams an image object directly from MinIO without generating a presigned S3 URL.
// Route: GET /api/public/images/:code
// :code is the file UUID used to look up the file record in the database.
func ShowImage(c *gin.Context) {
	code := c.Param("code")

	// Look up the file record by UUID
	var file model.File
	if err := config.PostgresClient.Where("uuid = ?", code).First(&file).Error; err != nil {
		c.JSON(http.StatusNotFound, config.GinErrorResponse(
			"Image not found",
			config.RestFulNotFound,
			config.RestFulCodeNotFound,
		))
		return
	}

	// Only serve image content types
	if len(file.ContentType) < 6 || file.ContentType[:6] != "image/" {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			"File is not an image",
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	// Fetch the object from MinIO
	cfg := config.GetConfig()
	out, err := config.S3Client.GetObject(context.Background(), &s3.GetObjectInput{
		Bucket: aws.String(cfg.MiniOFinalBucketName),
		Key:    aws.String(file.StorageKey),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			"Failed to retrieve image",
			config.RestFulInternalError,
			config.RestFulCodeInternalError,
		))
		return
	}
	defer out.Body.Close()

	contentType := file.ContentType
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	c.Header("Content-Type", contentType)
	c.Header("Cache-Control", "public, max-age=86400")
	c.Status(http.StatusOK)
	io.Copy(c.Writer, out.Body)
}
