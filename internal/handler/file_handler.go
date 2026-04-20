package handler

import (
	"net/http"
	"url-shortener/internal/config"
	"url-shortener/internal/http/response"
	"url-shortener/internal/model"
	"url-shortener/internal/service"

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
		fileResponses[i] = response.FileResponse{
			UUID:        file.UUID.String(),
			FileName:    file.FileName,
			FileType:    string(file.FileType),
			ContentType: file.ContentType,
			Size:        file.Size,
			IsShared:    file.IsShared,
			FolderUUID:  nil,
			FolderName:  "root",
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

func ShareFile(c *gin.Context) {

}

func UnShareFile(c *gin.Context) {

}

func DownloadFile(c *gin.Context) {

}
