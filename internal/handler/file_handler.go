package handler

import (
	"fmt"
	"io"
	"net/http"
	"strconv"
	"url-shortener/internal/config"
	"url-shortener/internal/model"
	"url-shortener/internal/model/response"
	"url-shortener/internal/service"

	"github.com/gin-gonic/gin"
)

func GetFiles(c *gin.Context) {
	accountUUID := c.GetString("accountUUID")
	account, err := service.GetAccountByUUID(accountUUID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			config.Unauthorize,
			config.RestFulUnauthorized,
			config.RestFulCodeUnauthorized,
		))
		return
	}

	files, err := service.GetFilesFromAccountID(account.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			err.Error(),
			config.RestFulInternalError,
			config.RestFulCodeInternalError,
		))
		return
	}

	fileResponse := make([]response.FileResponse, len(files))
	for i, file := range files {

		folderName := "root"
		var folderUUID *string

		if file.Folder != nil {
			uuidStr := file.Folder.UUID.String()

			folderName = file.Folder.Name
			folderUUID = &uuidStr
		} else {
			folderUUID = nil
		}

		fileResponse[i] = response.FileResponse{
			UUID:        file.UUID.String(),
			FileName:    file.FileName,
			FileType:    string(file.FileType),
			ContentType: file.ContentType,
			Size:        file.Size,
			FolderUUID:  folderUUID,
			FolderName:  folderName,
			UploadedAt:  file.UploadedAt,
		}
	}

	response := response.FileListResponse{
		OwnerUUID: account.UUID.String(),
		Files:     fileResponse,
	}

	c.JSON(http.StatusOK, config.GinResponse(
		response,
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))
}

func UploadFile(c *gin.Context) {
	accountUUID := c.GetString("accountUUID")
	account, err := service.GetAccountByUUID(accountUUID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			config.Unauthorize,
			config.RestFulUnauthorized,
			config.RestFulCodeUnauthorized,
		))
		return
	}

	fileHeader, err := c.FormFile("file")
	folderUUIDInput := c.PostForm("folder")

	if err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			config.InvalidRequestBody,
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	if !service.IVerifyServiceStore(account, fileHeader) {
		c.JSON(http.StatusForbidden, config.GinErrorResponse(
			config.StorageLimitExceeded,
			config.RestFulForbidden,
			config.RestFulCodeForbidden,
		))
		return
	}

	file, err := service.CreateFile(
		c.Request.Context(),
		account.ID,
		fileHeader,
		folderUUIDInput,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			err.Error(),
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	folderName := "root"
	var folderUUID *string

	if file.Folder != nil {
		uuidStr := file.Folder.UUID.String()

		folderName = file.Folder.Name
		folderUUID = &uuidStr
	} else {
		folderUUID = nil
	}

	response := response.FileResponse{
		UUID:        file.UUID.String(),
		FileName:    file.FileName,
		FileType:    string(file.FileType),
		ContentType: file.ContentType,
		Size:        file.Size,
		FolderUUID:  folderUUID,
		FolderName:  folderName,
		UploadedAt:  file.CreatedAt,
	}

	c.JSON(http.StatusOK, config.GinResponse(
		response,
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))

}

func GetImageFile(c *gin.Context) {
	code := c.Param("code")

	file, err := service.GetFileByUUID(code)
	if err != nil || file == nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			config.FileNotExists,
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	if file.FileType != model.FileTypeImage {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			config.FileNotImage,
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	object, err := service.GetImageURL(c.Request.Context(), file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			err.Error(),
			config.RestFulInternalError,
			config.RestFulCodeInternalError,
		))
		return
	}

	stat, err := object.Stat()
	if err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			err.Error(),
			config.RestFulInternalError,
			config.RestFulCodeInternalError,
		))
		return
	}

	c.Header("Content-Type", stat.ContentType)
	c.Header("Content-Length", fmt.Sprintf("%d", stat.Size))

	_, err = io.Copy(c.Writer, object)
	if err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			err.Error(),
			config.RestFulInternalError,
			config.RestFulCodeInternalError,
		))
		return
	}
}

type MoveFileRequest struct {
	FolderID *uint `json:"folder_id"`
}

func DeleteFile(c *gin.Context) {
	accountUUID := c.GetString("accountUUID")
	account, err := service.GetAccountByUUID(accountUUID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			config.Unauthorize,
			config.RestFulUnauthorized,
			config.RestFulCodeUnauthorized,
		))
		return
	}

	fileUUID := c.Param("uuid")

	err = service.DeleteFileByUUID(c.Request.Context(), account.ID, fileUUID)
	if err != nil {
		c.JSON(http.StatusNotFound, config.GinErrorResponse(
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

func DownloadFile(c *gin.Context) {
	accountUUID := c.GetString("accountUUID")
	account, err := service.GetAccountByUUID(accountUUID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			config.Unauthorize,
			config.RestFulUnauthorized,
			config.RestFulCodeUnauthorized,
		))
		return
	}

	fileUUID := c.Param("uuid")
	file, err := service.GetFileByUUIDAndAccountID(fileUUID, account.ID)
	if err != nil || file == nil {
		c.JSON(http.StatusNotFound, config.GinErrorResponse(
			config.FileNotExists,
			config.RestFulNotFound,
			config.RestFulCodeNotFound,
		))
		return
	}

	object, err := service.GetImageURL(c.Request.Context(), file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			err.Error(),
			config.RestFulInternalError,
			config.RestFulCodeInternalError,
		))
		return
	}

	stat, err := object.Stat()
	if err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			err.Error(),
			config.RestFulInternalError,
			config.RestFulCodeInternalError,
		))
		return
	}

	contentType := stat.ContentType
	if contentType == "" {
		contentType = file.ContentType
	}

	c.Header("Content-Type", contentType)
	c.Header("Content-Length", strconv.FormatInt(stat.Size, 10))
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%q", file.FileName))

	_, err = io.Copy(c.Writer, object)
	if err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			err.Error(),
			config.RestFulInternalError,
			config.RestFulCodeInternalError,
		))
		return
	}
}
