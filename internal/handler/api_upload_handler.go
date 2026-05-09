package handler

import (
	"net/http"
	"strings"
	"url-shortener/internal/config"
	"url-shortener/internal/http/request"
	"url-shortener/internal/model"
	"url-shortener/internal/service"
	"url-shortener/libs"

	"github.com/gin-gonic/gin"
)

// allowedImageTypes contains MIME types accepted by the API upload endpoints.
var allowedImageTypes = map[string]bool{
	"image/jpeg": true,
	"image/png":  true,
	"image/gif":  true,
	"image/webp": true,
	"image/bmp":  true,
	"image/tiff": true,
	"image/svg+xml": true,
	"image/avif": true,
	"image/heic": true,
	"image/heif": true,
}

// isImageContentType returns true when the MIME type starts with "image/".
func isImageContentType(ct string) bool {
	ct = strings.ToLower(strings.TrimSpace(ct))
	return strings.HasPrefix(ct, "image/") && allowedImageTypes[ct]
}

// accountFromAPIContext extracts the authenticated account set by APIMiddleware.
func accountFromAPIContext(c *gin.Context) (*model.Account, bool) {
	raw, exists := c.Get("account")
	if !exists {
		return nil, false
	}
	account, ok := raw.(*model.Account)
	return account, ok
}

// APIPresignUpload is the presign step for API-key-authenticated image uploads.
// POST /api/token/presign-upload
func APIPresignUpload(c *gin.Context) {
	account, ok := accountFromAPIContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, config.GinErrorResponse(
			"Unauthorized",
			config.RestFulUnauthorized,
			config.RestFulCodeUnauthorized,
		))
		return
	}

	var req request.PresignUploadRequest
	if err := libs.WithBind(c, &req); err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			err.Error(),
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	// Validate: only image content types are allowed
	for _, f := range req.Files {
		if !isImageContentType(f.ContentType) {
			c.JSON(http.StatusBadRequest, config.GinErrorResponse(
				"Only image files are allowed. Got: "+f.ContentType,
				config.RestFulInvalid,
				config.RestFulCodeInvalid,
			))
			return
		}
	}

	folderUUID := ""
	if req.FolderUUID != nil {
		folderUUID = *req.FolderUUID
	}

	result, err := service.BatchInit(c, account.ID, req.Files, folderUUID)
	if err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			err.Error(),
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	c.JSON(http.StatusOK, config.GinResponse(result, config.RestFulSuccess, nil, config.RestFulCodeSuccess))
}

// APISignUpload returns presigned S3 URL(s) for the given upload session.
// POST /api/token/sign-upload/:uuid
func APISignUpload(c *gin.Context) {
	_, ok := accountFromAPIContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, config.GinErrorResponse(
			"Unauthorized",
			config.RestFulUnauthorized,
			config.RestFulCodeUnauthorized,
		))
		return
	}

	sessionUUID := strings.TrimSpace(c.Param("uuid"))
	if sessionUUID == "" {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			"Required uuid parameter",
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	var req request.SignUploadRequest
	if err := libs.WithBind(c, &req); err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			err.Error(),
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	urls, err := service.SignURLUpload(c, sessionUUID, req)
	if len(urls) <= 0 || err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			err.Error(),
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	c.JSON(http.StatusOK, config.GinResponse(
		map[string]interface{}{"upload_urls": urls},
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))
}

// APICompleteSingleUpload finalises a single-part upload session.
// POST /api/token/complete-upload/:uuid
func APICompleteSingleUpload(c *gin.Context) {
	_, ok := accountFromAPIContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, config.GinErrorResponse(
			"Unauthorized",
			config.RestFulUnauthorized,
			config.RestFulCodeUnauthorized,
		))
		return
	}

	sessionUUID := strings.TrimSpace(c.Param("uuid"))
	if sessionUUID == "" {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			"Required uuid parameter",
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	file, err := service.CompleteSingleUpload(c, sessionUUID)
	if err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			err.Error(),
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	c.JSON(http.StatusOK, config.GinResponse(
		toFileResponse(file),
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))
}

// APICompleteMultipartUpload finalises a multipart upload session.
// POST /api/token/complete-multipart-upload/:uuid
func APICompleteMultipartUpload(c *gin.Context) {
	_, ok := accountFromAPIContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, config.GinErrorResponse(
			"Unauthorized",
			config.RestFulUnauthorized,
			config.RestFulCodeUnauthorized,
		))
		return
	}

	sessionUUID := strings.TrimSpace(c.Param("uuid"))
	if sessionUUID == "" {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			"Required uuid parameter",
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	var req request.CompleteMultipartUploadRequest
	if err := libs.WithBind(c, &req); err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			err.Error(),
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	file, err := service.CompleteMultipartUpload(c, sessionUUID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			err.Error(),
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	c.JSON(http.StatusOK, config.GinResponse(
		toFileResponse(file),
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))
}
