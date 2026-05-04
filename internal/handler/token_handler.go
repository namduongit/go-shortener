package handler

import (
	"net/http"
	"url-shortener/internal/config"
	"url-shortener/internal/http/response"
	"url-shortener/internal/model"
	"url-shortener/internal/service"

	"github.com/gin-gonic/gin"
)

func GetTokens(c *gin.Context) {
	account := c.MustGet("account").(*model.Account)

	tokens, err := service.GetTokensByAccountID(account.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			err.Error(), config.RestFulInvalid, config.RestFulCodeInvalid,
		))
		return
	}

	tokenResponses := make([]response.TokenResponse, len(tokens))
	for i, t := range tokens {
		tokenResponses[i] = response.TokenResponse{
			UUID:      t.UUID.String(),
			Name:      t.Name,
			Token:     t.Token,
			ExpiresAt: t.ExpiresAt,
			CreatedAt: t.CreatedAt,
		}
	}

	c.JSON(http.StatusOK, config.GinResponse(
		response.TokenListResponse{
			OwnerUUID: account.UUID.String(),
			Tokens:    tokenResponses,
		},
		config.RestFulSuccess, nil, config.RestFulCodeSuccess,
	))
}

type createTokenRequest struct {
	Name string `json:"name" binding:"required"`
	Days *int   `json:"time"`
}

func CreateToken(c *gin.Context) {
	account := c.MustGet("account").(*model.Account)

	var req createTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			err.Error(), config.RestFulInvalid, config.RestFulCodeInvalid,
		))
		return
	}

	token, privateToken, err := service.CreateToken(account.ID, req.Name, req.Days)
	if err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			err.Error(), config.RestFulInvalid, config.RestFulCodeInvalid,
		))
		return
	}

	// Ghi log async
	go service.WriteLog(account.ID, model.LogActionCreateToken,
		"Tạo token: "+req.Name, c.ClientIP(), c.Request.UserAgent())

	c.JSON(http.StatusOK, config.GinResponse(
		response.TokenResponse{
			UUID:         token.UUID.String(),
			Name:         token.Name,
			Token:        token.Token,
			PublicToken:  token.Token,
			PrivateToken: &privateToken,
			ExpiresAt:    token.ExpiresAt,
			CreatedAt:    token.CreatedAt,
		},
		config.RestFulSuccess, nil, config.RestFulCodeSuccess,
	))
}

func DeleteToken(c *gin.Context) {
	account := c.MustGet("account").(*model.Account)
	uuid := c.Param("uuid")

	if err := service.DeleteToken(uuid, account.ID); err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			err.Error(), config.RestFulInvalid, config.RestFulCodeInvalid,
		))
		return
	}

	c.JSON(http.StatusOK, config.GinResponse(nil, config.RestFulSuccess, nil, config.RestFulCodeSuccess))
}

type renewTokenRequest struct {
	Days int `json:"days"`
}

func RenewToken(c *gin.Context) {
	account := c.MustGet("account").(*model.Account)
	uuid := c.Param("uuid")

	var req renewTokenRequest
	_ = c.ShouldBindJSON(&req)

	token, err := service.RenewToken(uuid, account.ID, req.Days)
	if err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			err.Error(), config.RestFulInvalid, config.RestFulCodeInvalid,
		))
		return
	}

	c.JSON(http.StatusOK, config.GinResponse(
		response.TokenResponse{
			UUID:      token.UUID.String(),
			Name:      token.Name,
			Token:     token.Token,
			ExpiresAt: token.ExpiresAt,
			CreatedAt: token.CreatedAt,
		},
		config.RestFulSuccess, nil, config.RestFulCodeSuccess,
	))
}
