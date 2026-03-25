package middleware

import (
	"fmt"
	"net/http"
	"strings"
	"url-shortener/internal/config"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var jwtKey = []byte(config.GetConfig().JWTSecret)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, config.GinErrorResponse(
				[]string{"Authorization header required"},
				config.RestFulInvalid,
				config.RestFulCodeInvalid,
			))
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, config.GinErrorResponse(
				[]string{"Invalid authorization header"},
				config.RestFulInvalid,
				config.RestFulCodeInvalid,
			))
			return
		}

		tokenStr := parts[1]

		token, err := jwt.ParseWithClaims(tokenStr, jwt.MapClaims{}, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

		fmt.Println(token, err)

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, config.GinErrorResponse(
				[]string{"Invalid token"},
				config.RestFulInvalid,
				config.RestFulCodeInvalid,
			))
			return
		}

		userID, ok := token.Claims.(jwt.MapClaims)["uid"].(float64)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, config.GinErrorResponse(
				[]string{"Invalid token claims"},
				config.RestFulInvalid,
				config.RestFulCodeInvalid,
			))
			return
		}

		fmt.Println(userID)
		c.Set("uid", uint(userID))

		c.Next()
	}
}
