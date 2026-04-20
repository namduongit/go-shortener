package handler

import (
	"net/http"
	"strings"
	"url-shortener/internal/config"
	"url-shortener/internal/http/request"
	"url-shortener/internal/http/response"
	"url-shortener/internal/service"
	"url-shortener/libs"

	"github.com/gin-gonic/gin"
)

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

	url, err := service.SignURLUpload(c, sessionUUID, req.PartNumber)

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

	response := response.SignUploadResponse{
		UploadURL: url,
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

/**
* * Store the Etag and size of each part in the database
 */
func UploadPart(c *gin.Context) {
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
	var req request.UploadPartRequest
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

	err := service.UploadPart(sessionUUID, req.PartNumber, req.ETag, req.SizeBytes)
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
			nil,
			config.RestFulSuccess,
			nil,
			config.RestFulCodeSuccess,
		),
	)
}

/**
*
 */
func CompleteUpload(c *gin.Context) {
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

	err := service.CompleteUpload(c, sessionUUID)
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
			nil,
			config.RestFulSuccess,
			nil,
			config.RestFulCodeSuccess,
		),
	)
}
