package handler

import (
	"net/http"
	"strconv"
	"strings"
	"url-shortener/internal/config"
	"url-shortener/internal/model/response"
	"url-shortener/internal/service"

	"github.com/gin-gonic/gin"
)

func GetUrls(c *gin.Context) {
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

	urls, err := service.GetListURLsByAccountID(accountID)
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
			ID:          url.ID,
			Code:        url.ShortCode,
			OriginalURL: url.LongURL,
			ShortURL:    cfg.ServerDirect + "/" + url.ShortCode,
			Description: url.Description,
			CreatedAt:   url.CreatedAt,
		}
	}

	response := response.URLListResponse{
		OwnerID: accountID,
		URLs:    urlResponse,
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

	var req CreateURLRequest
	if err := c.ShouldBindJSON(&req); err != nil || req.URL == "" {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			config.InvalidRequestBody,
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	url, err := service.CreateShortURL(accountID, req.URL, req.Description)
	if err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			err.Error(),
			config.RestFulInternalError,
			config.RestFulCodeInternalError,
		))
		return
	}

	urlResponse := response.URLResponse{
		ID:          url.ID,
		Code:        url.ShortCode,
		OriginalURL: url.LongURL,
		Description: url.Description,
		ShortURL:    cfg.ServerDirect + "/" + url.ShortCode,
		CreatedAt:   url.CreatedAt,
	}

	c.JSON(http.StatusOK, config.GinResponse(
		urlResponse,
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))

}

func DeleteURL(c *gin.Context) {
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

	urlID64, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			"Invalid url id",
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	err = service.DeleteURLByID(accountID, uint(urlID64))
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
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
