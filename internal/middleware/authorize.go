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
				c.JSON(http.StatusUnauthorized, config.GinErrorResponse(
					"Authorization header is required",
					config.RestFulInvalid,
					config.RestFulCodeInvalid,
				))
				return
			}

			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") || parts[1] == "" {
				c.JSON(http.StatusUnauthorized, config.GinErrorResponse(
					"Invalid token format",
					config.RestFulInvalid,
					config.RestFulCodeInvalid,
				))
				return
			}

			tokenStr = parts[1]
		}

		claims, err := utils.VerifyToken(tokenStr, string(jwtKey))
		if err != nil {
			c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
				"Invalid or expired token",
				config.RestFulUnauthorized,
				config.RestFulCodeUnauthorized,
			))
			return
		}

		/**
		* * The 'version_id' claim is used to track the version of the token
		* ! The version of account will be updated when password is changed
		* ? @variable: accountUUID -> get account by uuid
		* ? @variable: version -> check if the token is expired or not by comparing with account version
		 */
		accountUUID := claims["uuid"].(string)
		version := uint(claims["version_id"].(float64))

		account, err := service.GetAccountByUUIDString(accountUUID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, config.GinErrorResponse(
				err.Error(),
				config.RestFulUnauthorized,
				config.RestFulCodeUnauthorized,
			))
			return
		}

		if account.Version != version {
			c.JSON(http.StatusUnauthorized, config.GinErrorResponse(
				"Token is expired",
				config.RestFulUnauthorized,
				config.RestFulCodeUnauthorized,
			))
			// Clear the cookie later
			return
		}

		c.Set("accountUUID", account.UUID)
		c.Set("accountID", account.ID)
		c.Set("account", account)

		fmt.Printf("Received request with claims: %v", claims)

		c.Next()
	}
}
