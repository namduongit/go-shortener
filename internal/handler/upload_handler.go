package handler

import (
	"net/http"
	"strings"
	"url-shortener/internal/config"
	"url-shortener/internal/http/request"
	"url-shortener/internal/http/response"
	"url-shortener/internal/model"
	"url-shortener/internal/service"
	"url-shortener/libs"

	"github.com/gin-gonic/gin"
)

// toFileResponse maps a model.File to a response.FileResponse.
// FolderUUID and FolderName are populated only when the file belongs to a folder
// (Folder association must be preloaded by the caller, or left nil).
func toFileResponse(f *model.File) response.FileResponse {
	r := response.FileResponse{
		UUID:        f.UUID.String(),
		FileName:    f.FileName,
		ContentType: f.ContentType,
		Size:        f.Size,
		IsShared:    f.IsShared,
		UploadedAt:  f.CreatedAt,
	}
	if f.Folder != nil {
		uuidStr := f.Folder.UUID.String()
		r.FolderUUID = &uuidStr
		r.FolderName = f.Folder.Name
	}
	return r
}

/**
* * Generate upload URL for single or multipart upload
* * For multipart upload, the client will call SignUpload API to get the upload URL for each part, and call UploadPart API to store the Etag and size of each part in the database. Finally, the client will call CompleteUpload API to complete the upload process.
 */

func SignUpload(c *gin.Context) {
	sessionUUID := strings.TrimSpace(c.Param("uuid"))
	if sessionUUID == "" {
		c.JSON(
			http.StatusBadRequest,
			config.GinErrorResponse(
				"Required uuid parameter",
				config.RestFulInvalid,
				config.RestFulCodeInvalid,
			))
		return
	}

	var req request.SignUploadRequest
	if err := libs.WithBind(c, &req); err != nil {
		c.JSON(
			http.StatusBadRequest,
			config.GinErrorResponse(
				err.Error(),
				config.RestFulInvalid,
				config.RestFulCodeInvalid,
			),
		)
		return
	}

	urls, err := service.SignURLUpload(c, sessionUUID, req)

	if len(urls) <= 0 || err != nil {
		c.JSON(
			http.StatusBadRequest,
			config.GinErrorResponse(
				err.Error(),
				config.RestFulInvalid,
				config.RestFulCodeInvalid,
			),
		)

		return
	}

	l := make([]string, 0, len(urls))

	for _, url := range urls {
		l = append(l, strings.ReplaceAll(url, config.GetConfig().StreamUrl, config.GetConfig().ReplaceStream))
	}

	response := response.SignUploadResponse{
		UploadURLs: l,
	}

	c.JSON(
		http.StatusOK,
		config.GinResponse(
			response,
			config.RestFulSuccess,
			nil,
			config.RestFulCodeSuccess,
		),
	)
}

func CompleteSingleUpload(c *gin.Context) {
	sessionUUID := strings.TrimSpace(c.Param("uuid"))
	if sessionUUID == "" {
		c.JSON(
			http.StatusBadRequest,
			config.GinErrorResponse(
				"Required uuid parameter",
				config.RestFulInvalid,
				config.RestFulCodeInvalid,
			))
		return
	}

	file, err := service.CompleteSingleUpload(c, sessionUUID)
	if err != nil {
		c.JSON(
			http.StatusBadRequest,
			config.GinErrorResponse(
				err.Error(),
				config.RestFulInvalid,
				config.RestFulCodeInvalid,
			),
		)
		return
	}

	c.JSON(
		http.StatusOK,
		config.GinResponse(
			toFileResponse(file),
			config.RestFulSuccess,
			nil,
			config.RestFulCodeSuccess,
		),
	)
}

func CompleteMultipartUpload(c *gin.Context) {
	sessionUUID := strings.TrimSpace(c.Param("uuid"))
	if sessionUUID == "" {
		c.JSON(
			http.StatusBadRequest,
			config.GinErrorResponse(
				"Required uuid parameter",
				config.RestFulInvalid,
				config.RestFulCodeInvalid,
			))
		return
	}

	var req request.CompleteMultipartUploadRequest
	if err := libs.WithBind(c, &req); err != nil {
		c.JSON(
			http.StatusBadRequest,
			config.GinErrorResponse(
				err.Error(),
				config.RestFulInvalid,
				config.RestFulCodeInvalid,
			),
		)
		return
	}

	file, err := service.CompleteMultipartUpload(c, sessionUUID, req)
	if err != nil {
		c.JSON(
			http.StatusBadRequest,
			config.GinErrorResponse(
				err.Error(),
				config.RestFulInvalid,
				config.RestFulCodeInvalid,
			),
		)
		return
	}

	c.JSON(
		http.StatusOK,
		config.GinResponse(
			toFileResponse(file),
			config.RestFulSuccess,
			nil,
			config.RestFulCodeSuccess,
		),
	)
}
