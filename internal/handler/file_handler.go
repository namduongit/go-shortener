package handler

import (
	"context"
	"fmt"
	"net/http"
	"url-shortener/internal/config"
	"url-shortener/internal/http/response"
	"url-shortener/internal/model"
	"url-shortener/internal/service"

	"github.com/aws/aws-sdk-go-v2/aws"
	s3 "github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
)

func GetFiles(c *gin.Context) {
	account := c.MustGet("account").(*model.Account)

	files, err := service.GetFiles(account.ID)
	if err != nil {
		c.JSON(
			http.StatusBadRequest,
			config.GinErrorResponse(
				err.Error(),
				config.RestFulInvalid,
				config.RestFulCodeInvalid,
			),
		)
	}

	fileResponses := make([]response.FileResponse, len(files))
	for i, file := range files {
		var folderName = "root"
		var folderUUID *string = nil
		if file.FolderID != nil {
			folderName = file.Folder.Name
			uuidStr := file.Folder.UUID.String()
			folderUUID = &uuidStr
		}
		fileResponses[i] = response.FileResponse{
			UUID:        file.UUID.String(),
			FileName:    file.FileName,
			ContentType: file.ContentType,
			Size:        file.Size,
			IsShared:    file.IsShared,
			FolderUUID:  folderUUID,
			FolderName:  folderName,
			UploadedAt:  file.CreatedAt,
		}
	}

	response := response.FileListResponse{
		OwnerUUID: account.UUID.String(),
		Files:     fileResponses,
	}

	c.JSON(
		http.StatusOK,
		config.GinResponse(
			response,
			config.RestFulSuccess,
			nil,
			config.RestFulCodeSuccess,
		))
}

func DeleteFile(c *gin.Context) {
	account := c.MustGet("account").(*model.Account)

	fileUUID := c.Param("uuid")

	err := service.DeleteFileByUUID(account.ID, fileUUID)
	if err != nil {
		c.JSON(
			http.StatusNotFound,
			config.GinErrorResponse(
				err.Error(),
				config.RestFulNotFound,
				config.RestFulCodeNotFound,
			))
		return
	}

	c.JSON(http.StatusOK, config.GinResponse(
		nil,
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))
}

// ShareFile marks a file as publicly shared so it can be downloaded via share link.
// Route: POST /api/guard/files/:uuid/share
func ShareFile(c *gin.Context) {
	account := c.MustGet("account").(*model.Account)
	fileUUID := c.Param("uuid")

	file, err := service.ShareFileByUUID(account.ID, fileUUID, true)
	if err != nil {
		c.JSON(http.StatusNotFound, config.GinErrorResponse(
			err.Error(),
			config.RestFulNotFound,
			config.RestFulCodeNotFound,
		))
		return
	}

	var folderUUID *string
	var folderName = "root"
	if file.FolderID != nil && file.Folder != nil {
		uuidStr := file.Folder.UUID.String()
		folderUUID = &uuidStr
		folderName = file.Folder.Name
	}

	res := response.FileResponse{
		UUID:        file.UUID.String(),
		FileName:    file.FileName,
		ContentType: file.ContentType,
		Size:        file.Size,
		IsShared:    file.IsShared,
		FolderUUID:  folderUUID,
		FolderName:  folderName,
		UploadedAt:  file.CreatedAt,
	}

	c.JSON(http.StatusOK, config.GinResponse(res, config.RestFulSuccess, nil, config.RestFulCodeSuccess))
}

// UnShareFile revokes public sharing of a file.
// Route: POST /api/guard/files/:uuid/unshare
func UnShareFile(c *gin.Context) {
	account := c.MustGet("account").(*model.Account)
	fileUUID := c.Param("uuid")

	file, err := service.ShareFileByUUID(account.ID, fileUUID, false)
	if err != nil {
		c.JSON(http.StatusNotFound, config.GinErrorResponse(
			err.Error(),
			config.RestFulNotFound,
			config.RestFulCodeNotFound,
		))
		return
	}

	var folderUUID *string
	var folderName = "root"
	if file.FolderID != nil && file.Folder != nil {
		uuidStr := file.Folder.UUID.String()
		folderUUID = &uuidStr
		folderName = file.Folder.Name
	}

	res := response.FileResponse{
		UUID:        file.UUID.String(),
		FileName:    file.FileName,
		ContentType: file.ContentType,
		Size:        file.Size,
		IsShared:    file.IsShared,
		FolderUUID:  folderUUID,
		FolderName:  folderName,
		UploadedAt:  file.CreatedAt,
	}

	c.JSON(http.StatusOK, config.GinResponse(res, config.RestFulSuccess, nil, config.RestFulCodeSuccess))
}

// DownloadFile streams a file to the owner directly (authenticated).
// Route: GET /api/guard/file/:uuid/download
func DownloadFile(c *gin.Context) {
	account := c.MustGet("account").(*model.Account)
	fileUUID := c.Param("uuid")

	file, err := service.GetFileByUUID(account.ID, fileUUID)
	if err != nil {
		c.JSON(http.StatusNotFound, config.GinErrorResponse(
			"File not found",
			config.RestFulNotFound,
			config.RestFulCodeNotFound,
		))
		return
	}

	streamFile(c, file)
}

// DownloadSharedFile streams a shared file to the requester (no auth required).
// The ShareFileMiddleware already verified the file is shared before this runs.
// Route: GET /api/share/files/:code
func DownloadSharedFile(c *gin.Context) {
	file := c.MustGet("sharedFile").(*model.File)
	streamFile(c, file)
}

// streamFile fetches the object from MinIO and writes it to the HTTP response.
func streamFile(c *gin.Context, file *model.File) {
	cfg := config.GetConfig()

	out, err := config.S3Client.GetObject(context.Background(), &s3.GetObjectInput{
		Bucket: aws.String(cfg.MiniOFinalBucketName),
		Key:    aws.String(file.StorageKey),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			"Failed to retrieve file",
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
	c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, file.FileName))
	c.Header("Cache-Control", "no-store")

	if out.ContentLength != nil && *out.ContentLength > 0 {
		c.Header("Content-Length", fmt.Sprintf("%d", *out.ContentLength))
	}

	c.Status(http.StatusOK)
	// Stream body to client
	buf := make([]byte, 32*1024)
	for {
		n, readErr := out.Body.Read(buf)
		if n > 0 {
			c.Writer.Write(buf[:n])
		}
		if readErr != nil {
			break
		}
	}
}
