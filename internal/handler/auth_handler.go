package handler

import (
	"net/http"
	"url-shortener/internal/config"
	"url-shortener/internal/model/response"
	"url-shortener/internal/service"
	"url-shortener/internal/utils"

	"github.com/gin-gonic/gin"
)

var cfg = config.GetConfig()

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			config.InvalidRequestBody,
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	account, err := service.Register(req.Email, req.Password)
	if err != nil {
		c.JSON(
			http.StatusBadRequest,
			config.GinErrorResponse(
				err.Error(),
				config.RestFulInvalid,
				config.RestFulCodeInvalid,
			))
		return
	}

	response := response.RegisterResponse{
		UUID:  account.UUID.String(),
		Email: account.Email,
		Plan: response.PlanDetailResponse{
			UUID:         account.Plan.UUID.String(),
			Name:         account.Plan.Name,
			StorageLimit: account.Plan.StorageLimit,
		},
	}

	c.JSON(http.StatusOK, config.GinResponse(
		response,
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			config.InvalidRequestBody,
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	account, err := service.Login(req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusBadRequest, config.GinErrorResponse(
			err.Error(),
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
		return
	}

	tokenString, _ := utils.GenerateToken(
		map[string]any{
			"email":     account.Email,
			"plan_name": account.Plan.Name,
			"join_date": account.CreatedAt.Unix(),
		},
		string(account.Role),
		account.UUID.String(),
		account.ID,
		string(cfg.JWTSecret),
	)

	response := response.LoginResponse{
		UUID:  account.UUID.String(),
		Email: account.Email,
		Plan: response.PlanDetailResponse{
			UUID:         account.Plan.UUID.String(),
			Name:         account.Plan.Name,
			StorageLimit: account.Plan.StorageLimit,
		},
	}

	secureCookie := cfg.ENV == config.Production

	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "accessToken",
		Value:    *tokenString,
		Path:     "/",
		MaxAge:   24 * 60 * 60 * 7,
		HttpOnly: true,
		Secure:   secureCookie,
		SameSite: http.SameSiteLaxMode,
	})

	c.JSON(http.StatusOK, config.GinResponse(
		response,
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))
}

func AuthConfig(c *gin.Context) {
	tokenStr, _ := c.Cookie("accessToken")
	authenticated := false

	accountUUID := c.GetString("accountUUID")
	account, err := service.GetAccountByUUID(accountUUID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
			err.Error(),
			config.RestFulUnauthorized,
			config.RestFulCodeUnauthorized,
		))
		return
	}

	isValid, iat, exp, err := utils.VerifyToken(tokenStr, string(cfg.JWTSecret))
	if err != nil {
		clearAccessTokenCookie(c)
		c.JSON(http.StatusUnauthorized, config.GinErrorResponse(
			err.Error(),
			config.RestFulUnauthorized,
			config.RestFulCodeUnauthorized,
		))
		return
	}

	response := response.ConfigResponse{
		UUID:  account.UUID.String(),
		Email: account.Email,
		Config: response.ConfigDetailResponse{
			IsValid:   isValid,
			IssueAt:   iat,
			ExpiresIn: exp,
		},
	}

	if isValid {
		authenticated = true
	}

	response.Config.IsValid = authenticated

	c.JSON(http.StatusOK, config.GinResponse(
		response,
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))
}

func Logout(c *gin.Context) {
	clearAccessTokenCookie(c)

	c.JSON(http.StatusOK, config.GinResponse(
		nil,
		config.RestFulSuccess,
		nil,
		config.RestFulCodeSuccess,
	))
}

func clearAccessTokenCookie(c *gin.Context) {
	secureCookie := cfg.ENV == config.Production
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "accessToken",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   secureCookie,
		SameSite: http.SameSiteLaxMode,
	})
}
