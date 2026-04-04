package handler

import (
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"url-shortener/internal/config"
	"url-shortener/internal/model"
	"url-shortener/internal/model/response"
	"url-shortener/internal/service"

	"github.com/gin-gonic/gin"
)

func GetFiles(c *gin.Context) {
	accountID := c.GetUint("accountID")
	_, err := service.GetAccountByID(accountID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			err.Error(),
			config.RestFulInternalError,
			config.RestFulCodeInternalError,
		))
		return
	}

	files, err := service.GetFilesByAccountID(accountID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			[]string{"Cannot fetch files"},
			config.RestFulInternalError,
			config.RestFulCodeInternalError,
		))
		return
	}

	fileResponse := make([]response.FileResponse, len(files))
	for i, file := range files {
		folderName := "root"
		var folderID *uint

		if file.FolderID != nil {
			folderID = file.FolderID
		}
		if file.Folder != nil {
			folderName = file.Folder.Name
			folderID = &file.Folder.ID
		}
		fileResponse[i] = response.FileResponse{
			ID:          file.ID,
			FileName:    file.FileName,
			FileType:    string(file.FileType),
			ContentType: file.ContentType,
			Size:        file.Size,
			FolderName:  folderName,
			FolderID:    folderID,
			UploadedAt:  file.CreatedAt,
		}
	}

	response := response.FileListResponse{
		OwnerID: accountID,
		Files:   fileResponse,
	}

	c.JSON(http.StatusOK, config.GinResponse(
		response,
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))
}

func UploadFile(c *gin.Context) {
	accountID := c.GetUint("accountID")
	account, err := service.GetAccountByID(accountID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			err.Error(),
			config.RestFulInternalError,
			config.RestFulCodeInternalError,
		))
		return
	}

	if err := service.PreloadPlanForAccount(account); err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			err.Error(),
			config.RestFulInternalError,
			config.RestFulCodeInternalError,
		))
		return
	}

	fileHeader, err := c.FormFile("file")
	folderID := c.PostForm("folderID")

	if err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			err.Error(),
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	file, err := service.PushFileToCloud(c.Request.Context(), accountID, fileHeader, folderID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			err.Error(),
			config.RestFulInternalError,
			config.RestFulCodeInternalError,
		))
		return
	}

	respnse := response.FileResponse{
		ID:          file.ID,
		FileName:    file.FileName,
		FileType:    string(file.FileType),
		ContentType: file.ContentType,
		Size:        file.Size,
		FolderID:    file.FolderID,

		UploadedAt: file.CreatedAt,
	}

	c.JSON(http.StatusOK, config.GinResponse(
		respnse,
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))

}

func GetImageFile(c *gin.Context) {
	code := c.Param("code")

	fileID, err := strconv.ParseUint(code, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			err.Error(),
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	file, err := service.GetFileByID(uint(fileID))
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

func MoveFile(c *gin.Context) {
	accountID := c.GetUint("accountID")
	_, err := service.GetAccountByID(accountID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			err.Error(),
			config.RestFulInternalError,
			config.RestFulCodeInternalError,
		))
		return
	}

	fileID64, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			"Invalid file id",
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	var req MoveFileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			config.InvalidRequestBody,
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	err = service.MoveFileToFolder(accountID, uint(fileID64), req.FolderID)
	if err != nil {
		if strings.Contains(err.Error(), "not found") || strings.Contains(err.Error(), "not exists") {
			c.JSON(http.StatusNotFound, config.GinErrorResponse(
				err.Error(),
				config.RestFulNotFound,
				config.RestFulCodeNotFound,
			))
			return
		}

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

func DeleteFile(c *gin.Context) {
	accountID := c.GetUint("accountID")
	_, err := service.GetAccountByID(accountID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			err.Error(),
			config.RestFulInternalError,
			config.RestFulCodeInternalError,
		))
		return
	}

	fileID64, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			"Invalid file id",
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	err = service.DeleteFileByID(c.Request.Context(), accountID, uint(fileID64))
	if err != nil {
		if strings.Contains(err.Error(), "not found") || strings.Contains(err.Error(), "not exists") {
			c.JSON(http.StatusNotFound, config.GinErrorResponse(
				err.Error(),
				config.RestFulNotFound,
				config.RestFulCodeNotFound,
			))
			return
		}

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
