package handler

import (
	"net/http"
	"url-shortener/internal/config"
	"url-shortener/internal/model/response"
	"url-shortener/internal/service"

	"github.com/gin-gonic/gin"
)

func GetUrls(c *gin.Context) {
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
			ShortURL:    cfg.ServerHost + "/api/guard/url/" + url.ShortCode + "/direct",
			Description: url.Description,
			CreatedAt:   url.CreatedAt,
		}
	}

	response := response.URLListResponse{
		OwnerUUID: accountUUID,
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

	var req CreateURLRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			config.InvalidRequestBody,
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	if !service.IVerifyServiceCountURL(account) {
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
		ShortURL:    cfg.ServerHost + "/api/guard/url/" + url.ShortCode + "/direct",
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
	accountUUID := c.GetString("accountUUID")
	_, err := service.GetAccountByUUID(accountUUID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			config.Unauthorize,
			config.RestFulUnauthorized,
			config.RestFulCodeUnauthorized,
		))
		return
	}

	urlUUID := c.Param("uuid")
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
