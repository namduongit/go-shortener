package handler

import (
	"net/http"
	"url-shortener/internal/config"
	"url-shortener/internal/model"
	"url-shortener/internal/model/response"
	"url-shortener/internal/service"

	"github.com/gin-gonic/gin"
)

func GetToken(c *gin.Context) {
	account := c.MustGet("account").(*model.Account)

	tokens, err := service.GetTokensByAccountID(account.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			err.Error(),
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	tokenResponses := make([]response.TokenResponse, len(tokens))
	for i, token := range tokens {
		tokenResponses[i] = response.TokenResponse{
			UUID:        token.UUID.String(),
			Name:        token.Name,
			Token:       token.Token,
			PublicToken: token.Token,
			ExpiresAt:   token.ExpiresAt,
			CreatedAt:   token.CreatedAt,
		}
	}

	response := response.TokenListResponse{
		OwnerUUID: account.UUID.String(),
		Tokens:    tokenResponses,
	}

	c.JSON(http.StatusOK, config.GinResponse(
		response,
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))
}

type CreateTokenRequest struct {
	Name string `json:"name"`
	Time *int   `json:"time"`
}

func CreateToken(c *gin.Context) {
	account := c.MustGet("account").(*model.Account)

	var req CreateTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			err.Error(),
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	token, privateToken, err := service.CreateToken(account.ID, req.Name, req.Time)
	if err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			err.Error(),
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	response := response.TokenResponse{
		UUID:         token.UUID.String(),
		Name:         token.Name,
		Token:        token.Token,
		PublicToken:  token.Token,
		PrivateToken: &privateToken,
		ExpiresAt:    token.ExpiresAt,
		CreatedAt:    token.CreatedAt,
	}

	c.JSON(http.StatusOK, config.GinResponse(
		response,
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))
}

func DeleteToken(c *gin.Context) {
	uuid := c.Param("uuid")

	err := service.DeleteToken(uuid)
	if err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			err.Error(),
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
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
