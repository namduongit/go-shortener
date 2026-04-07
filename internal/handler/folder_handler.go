package handler

import (
	"net/http"
	"url-shortener/internal/config"
	"url-shortener/internal/model"
	"url-shortener/internal/model/response"
	"url-shortener/internal/service"

	"github.com/gin-gonic/gin"
)

func GetFolders(c *gin.Context) {
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

	folders, err := service.GetFoldersByUserID(account.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
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

	c.JSON(http.StatusOK, config.GinResponse(
		response,
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))
}

type CreateFolderRequest struct {
	Name string `json:"name" binding:"required"`
}

func CreateFolder(c *gin.Context) {
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

	var req CreateFolderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			config.InvalidRequestBody,
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	existingFolder, _ := service.GetFolderByNameFromAccountID(req.Name, account.ID)

	if existingFolder != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			"Folder name already exists",
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	folder, err := service.CreateFolder(account.ID, req.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			err.Error(),
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	response := response.FolderResponse{
		UUID:       folder.UUID.String(),
		Name:       folder.Name,
		TotalFiles: folder.TotalFile,
		TotalSize:  folder.TotalSize,
		CreatedAt:  folder.CreatedAt,
	}

	c.JSON(http.StatusOK, config.GinResponse(
		response,
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))
}

func DeleteFolder(c *gin.Context) {
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

	folderUUID := c.Param("uuid")
	if folderUUID == "" {
		folderUUID = c.Param("id")
	}

	if folderUUID == "" {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			config.InvalidRequestBody,
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	folder, err := service.GetFolderByUUID(folderUUID)
	if err != nil || folder == nil || folder.AccountID != account.ID {
		c.JSON(http.StatusNotFound, config.GinErrorResponse(
			"Folder not found",
			config.RestFulNotFound,
			config.RestFulCodeNotFound,
		))
		return
	}

	if folder.TotalFile > 0 {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			"Folder has files",
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	if err := config.DBClient.Delete(&model.Folder{}, folder.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			err.Error(),
			config.RestFulInternalError,
			config.RestFulCodeInternalError,
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
