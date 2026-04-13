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
	account := c.MustGet("account").(*model.Account)
	files, err := service.GetFilesFromAccountID(account.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			err.Error(),
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
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
			IsShared:    file.IsShared,

			FolderUUID: folderUUID,
			FolderName: folderName,
			UploadedAt: file.UploadedAt,
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
	account := c.MustGet("account").(*model.Account)

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

	if !service.VerifyServiceStore(account, fileHeader) {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			config.StorageLimitExceeded,
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
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
		IsShared:    file.IsShared,
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

func DeleteFile(c *gin.Context) {
	account := c.MustGet("account").(*model.Account)

	fileUUID := c.Param("uuid")

	err := service.DeleteFileByUUID(c.Request.Context(), account.ID, fileUUID)
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
	accountData, hasAccount := c.Get("account")
	if !hasAccount {
		DownloadSharedFile(c)
		return
	}

	account, ok := accountData.(*model.Account)
	if !ok || account == nil {
		DownloadSharedFile(c)
		return
	}

	fileUUID := c.Param("uuid")
	file, err := service.GetFileByUUIDAndAccountID(fileUUID, account.ID)
	if err != nil || file == nil {
		DownloadSharedFile(c)
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

func ShareFile(c *gin.Context) {
	account := c.MustGet("account").(*model.Account)
	fileUUID := c.Param("uuid")

	file, err := service.ShareFileByUUIDAndAccountID(fileUUID, account.ID)
	if err != nil || file == nil {
		c.JSON(http.StatusNotFound, config.GinErrorResponse(
			config.FileNotExists,
			config.RestFulNotFound,
			config.RestFulCodeNotFound,
		))
		return
	}

	response := response.FileShareResponse{
		UUID:        file.UUID.String(),
		IsShared:    file.IsShared,
		DownloadURL: cfg.ServerHost + "/file/" + file.UUID.String() + "/download",
	}

	c.JSON(http.StatusOK, config.GinResponse(
		response,
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))
}

func UnShareFile(c *gin.Context) {
	account := c.MustGet("account").(*model.Account)
	fileUUID := c.Param("uuid")

	file, err := service.UnShareFileByUUIDAndAccountID(fileUUID, account.ID)
	if err != nil || file == nil {
		c.JSON(http.StatusNotFound, config.GinErrorResponse(
			config.FileNotExists,
			config.RestFulNotFound,
			config.RestFulCodeNotFound,
		))
		return
	}

	response := response.FileShareResponse{
		UUID:        file.UUID.String(),
		IsShared:    file.IsShared,
		DownloadURL: cfg.ServerHost + "/file/" + file.UUID.String() + "/download",
	}

	c.JSON(http.StatusOK, config.GinResponse(
		response,
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))
}

func DownloadSharedFile(c *gin.Context) {
	fileUUID := c.Param("uuid")
	fmt.Println("adasd")

	file, err := service.GetSharedFileByUUID(fileUUID)
	if err != nil || file == nil {
		c.JSON(http.StatusNotFound, config.GinErrorResponse(
			config.FileNotExists,
			config.RestFulNotFound,
			config.RestFulCodeNotFound,
		))
		return
	}

	if !file.IsShared {
		c.JSON(http.StatusForbidden, config.GinErrorResponse(
			config.FileNotShared,
			config.RestFulForbidden,
			config.RestFulCodeForbidden,
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
