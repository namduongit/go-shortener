package handler

import (
	"net/http"
	"url-shortener/internal/config"
	"url-shortener/internal/http/request"
	"url-shortener/internal/http/response"
	"url-shortener/internal/model"
	"url-shortener/internal/service"
	"url-shortener/libs"

	"github.com/gin-gonic/gin"
)

func GetFolders(c *gin.Context) {
	account := c.MustGet("account").(*model.Account)

	folders, err := service.GetFolders(account.ID)
	if err != nil {
		c.JSON(
			http.StatusBadRequest,
			config.GinErrorResponse(
				err.Error(),
				config.RestFulInvalid,
				config.RestFulCodeInvalid,
			))
		return
	}

	folderResponses := make([]response.FolderResponse, len(folders))
	for i, folder := range folders {
		folderResponses[i] = response.FolderResponse{
			UUID:       folder.UUID.String(),
			Name:       folder.Name,
			TotalFiles: folder.TotalFile,
			TotalSize:  folder.TotalSize,
			CreatedAt:  folder.CreatedAt,
		}
	}

	response := response.FolderListResponse{
		OwnerUUID: account.UUID.String(),
		Folders:   folderResponses,
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

func CreateFolder(c *gin.Context) {
	var req request.CreateFolderRequest
	if err := libs.WithBind(c, &req); err != nil {
		c.JSON(
			http.StatusBadRequest,
			config.GinErrorResponse(
				err.Error(),
				config.RestFulInvalid,
				config.RestFulCodeInvalid,
			))
		return
	}

}
