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

func GetShortURLs(c *gin.Context) {
	account := c.MustGet("account").(*model.Account)

	urls, err := service.GetShortURLs(account.ID)
	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			config.GinErrorResponse(
				err.Error(),
				config.RestFulInternalError,
				config.RestFulCodeInternalError,
			))
		return
	}

	urlResponses := make([]response.URLResponse, len(urls))
	for i, url := range urls {
		urlResponses[i] = response.URLResponse{
			UUID:        url.UUID.String(),
			Code:        url.ShortCode,
			OriginalURL: url.LongURL,
			Description: url.Description,
			CreatedAt:   url.CreatedAt,
		}
	}

	response := response.URLListResponse{
		OwnerUUID: account.UUID.String(),
		URLs:      urlResponses,
	}

	c.JSON(http.StatusOK, config.GinResponse(
		response,
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))

}

func CreateShortURL(c *gin.Context) {
	var req request.CreateShortUrLRequest
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

	account := c.MustGet("account").(*model.Account)

	url, err := service.CreateShortURL(account.ID, req.URL, req.Description)
	if err != nil {
		c.JSON(
			http.StatusNotFound,
			config.GinErrorResponse(
				err.Error(),
				config.RestFulInvalid,
				config.RestFulCodeInvalid,
			))
		return
	}

	response := response.URLResponse{
		UUID:        url.UUID.String(),
		Code:        url.ShortCode,
		OriginalURL: url.LongURL,
		Description: url.Description,
		CreatedAt:   url.CreatedAt,
	}

	c.JSON(http.StatusOK, config.GinResponse(
		response,
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))

}

func DirectURL(c *gin.Context) {
	code := c.Param("code")

	url, err := service.GetShortURLByCode(code)
	if err != nil {
		c.JSON(
			http.StatusNotFound,
			config.GinErrorResponse(
				err.Error(),
				config.RestFulInvalid,
				config.RestFulCodeInvalid,
			))
		return
	}

	c.Redirect(http.StatusMovedPermanently, url.LongURL)
}

func DeleteShortURL(c *gin.Context) {
	account := c.MustGet("account").(*model.Account)

	uuid := c.Param("uuid")
	if err := service.DeleteShortURLByUUID(account.ID, uuid); err != nil {
		c.JSON(http.StatusNotFound, config.GinErrorResponse(
			err.Error(),
			config.RestFulNotFound,
			config.RestFulCodeNotFound,
		))
		return
	}

	c.JSON(
		http.StatusOK,
		config.GinResponse(
			nil,
			config.RestFulSuccess,
			nil,
			config.RestFulCodeSuccess,
		))
}
