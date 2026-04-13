package handler

import (
	"net/http"
	"url-shortener/internal/config"
	"url-shortener/internal/model"
	"url-shortener/internal/model/response"
	"url-shortener/internal/service"

	"github.com/gin-gonic/gin"
)

func GetUrls(c *gin.Context) {
	account := c.MustGet("account").(*model.Account)

	urls, err := service.GetURLsFromAccountID(account.ID)
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

	urlResponse := make([]response.URLResponse, len(urls))
	for i, url := range urls {
		urlResponse[i] = response.URLResponse{
			UUID:        url.UUID.String(),
			Code:        url.ShortCode,
			OriginalURL: url.LongURL,
			Description: url.Description,
			CreatedAt:   url.CreatedAt,
		}
	}

	response := response.URLListResponse{
		OwnerUUID: account.UUID.String(),
		URLs:      urlResponse,
	}

	c.JSON(http.StatusOK, config.GinResponse(
		response,
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))

}

type CreateURLRequest struct {
	URL         string `json:"url"`
	Description string `json:"description"`
}

func CreateShortURL(c *gin.Context) {
	account := c.MustGet("account").(*model.Account)

	var req CreateURLRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			config.InvalidRequestBody,
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	if !service.VerifyServiceCountURL(account) {
		c.JSON(http.StatusForbidden, config.GinErrorResponse(
			config.URLLimitExceeded,
			config.RestFulForbidden,
			config.RestFulCodeForbidden,
		))
		return
	}

	url, err := service.CreateShortURL(account.ID, req.URL, req.Description)
	if err != nil {
		c.JSON(http.StatusNotFound, config.GinErrorResponse(
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

	url, err := service.GetURLByShortCode(code)
	if err != nil {
		c.JSON(http.StatusNotFound, config.GinErrorResponse(
			config.URLNotExists,
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	c.Redirect(http.StatusMovedPermanently, url.LongURL)
}

func DeleteURL(c *gin.Context) {
	account := c.MustGet("account").(*model.Account)

	urlUUID := c.Param("uuid")
	url, err := service.GetURLByUUID(urlUUID)
	if err != nil || url == nil || url.AccountID != account.ID {
		c.JSON(http.StatusNotFound, config.GinErrorResponse(
			config.URLNotExists,
			config.RestFulNotFound,
			config.RestFulCodeNotFound,
		))
		return
	}

	err = service.DeleteURLByUUID(urlUUID)
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
