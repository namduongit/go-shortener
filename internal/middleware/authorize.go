package middleware

import (
	"fmt"
	"net/http"
	"strings"
	"url-shortener/internal/config"
	"url-shortener/internal/service"
	"url-shortener/internal/utils"

	"github.com/gin-gonic/gin"
)

var jwtKey = []byte(config.GetConfig().JWTSecret)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenStr := ""
		if cookieToken, err := c.Cookie("accessToken"); err == nil && cookieToken != "" {
			tokenStr = cookieToken
		} else {
			authHeader := c.GetHeader("Authorization")
			if authHeader == "" {
				c.AbortWithStatusJSON(http.StatusUnauthorized, config.GinErrorResponse(
					config.RequireAuthentication,
					config.RestFulInvalid,
					config.RestFulCodeInvalid,
				))
				return
			}

			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") || parts[1] == "" {
				c.AbortWithStatusJSON(http.StatusUnauthorized, config.GinErrorResponse(
					config.InvalidToken,
					config.RestFulInvalid,
					config.RestFulCodeInvalid,
				))
				return
			}

			tokenStr = parts[1]
		}

		_, _, _, err := utils.VerifyToken(tokenStr, string(jwtKey))
		if err != nil {
			c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
				err.Error(),
				config.RestFulUnauthorized,
				config.RestFulCodeUnauthorized,
			))
			return
		}

		claims, err := utils.ParseToken(tokenStr, string(jwtKey))
		if err != nil {
			c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
				err.Error(),
				config.RestFulUnauthorized,
				config.RestFulCodeUnauthorized,
			))
			return
		}

		accountUUID := claims["uuid"].(string)
		version := uint(claims["version_id"].(float64))

		account, err := service.GetAccountByUUID(accountUUID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
				err.Error(),
				config.RestFulUnauthorized,
				config.RestFulCodeUnauthorized,
			))
			return
		}

		if account == nil {
			c.JSON(http.StatusUnauthorized, config.GinErrorResponse(
				config.AccountNotFound,
				config.RestFulUnauthorized,
				config.RestFulCodeUnauthorized,
			))
			return
		}

		if account.Version != version {
			c.JSON(http.StatusUnauthorized, config.GinErrorResponse(
				config.TokenIsOutdated,
				config.RestFulUnauthorized,
				config.RestFulCodeUnauthorized,
			))
			return
		}

		c.Set("accountUUID", account.UUID)
		c.Set("accountID", account.ID)
		c.Set("account", account)

		fmt.Println(claims)

		c.Next()
	}
}
