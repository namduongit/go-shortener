package middleware

import (
	"net/http"
	"url-shortener/internal/config"
	"url-shortener/internal/repository"
	"url-shortener/internal/utils"

	"github.com/gin-gonic/gin"
)

func APIMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		publicKey := c.GetHeader("X-Public-Key")
		privateKey := c.GetHeader("X-Private-Key")

		if publicKey == "" || privateKey == "" {
			c.JSON(
				http.StatusForbidden,
				config.GinErrorResponse(
					config.MissingAPIKey,
					config.RestFulForbidden,
					config.RestFulCodeForbidden,
				),
			)
			return
		}

		// Valid token
		isValid := utils.VerifyAPIToken(privateKey, publicKey)

		if !isValid {
			c.JSON(
				http.StatusUnauthorized,
				config.GinErrorResponse(
					config.InvalidToken,
					config.RestFulUnauthorized,
					config.RestFulCodeUnauthorized,
				),
			)
			return
		}

		// Get account from public key and set to context
		account, err := repository.GetFromPublicKey(publicKey)
		if err != nil {
			c.JSON(
				http.StatusUnauthorized,
				config.GinErrorResponse(
					config.AccountNotFound,
					config.RestFulUnauthorized,
					config.RestFulCodeUnauthorized,
				),
			)
			return
		}

		c.Set("account", account)

		c.Next()
	}
}
