package middleware

import (
	"fmt"
	"net/http"
	"strings"
	"url-shortener/internal/config"
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
					[]string{"Authentication required"},
					config.RestFulInvalid,
					config.RestFulCodeInvalid,
				))
				return
			}

			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") || parts[1] == "" {
				c.AbortWithStatusJSON(http.StatusUnauthorized, config.GinErrorResponse(
					[]string{"Invalid authorization header"},
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
		accountID := uint(claims["id"].(float64))

		c.Set("accountUUID", accountUUID)
		c.Set("accountID", accountID)

		fmt.Println("Request provide token with uuid has value is: ", claims["uuid"])
		fmt.Println("Request provide token with id has value is: ", claims["id"])
		fmt.Println(claims)

		c.Next()
	}
}
