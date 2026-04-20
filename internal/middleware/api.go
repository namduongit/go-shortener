package middleware

// import (
// 	"net/http"
// 	"url-shortener/internal/config"
// 	"url-shortener/internal/utils"

// 	"github.com/gin-gonic/gin"
// )

// func APIMiddleware() gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		publicKey := c.GetHeader("X-Public-Key")
// 		privateKey := c.GetHeader("X-Private-Key")

// 		if publicKey == "" || privateKey == "" {
// 			c.JSON(
// 				http.StatusForbidden,
// 				config.GinErrorResponse(
// 					"Missing API keys",
// 					config.RestFulForbidden,
// 					config.RestFulCodeForbidden,
// 				),
// 			)
// 			return
// 		}

// 		token, err := repository.GetTokenByPublicToken(publicKey)
// 		if err != nil {
// 			c.JSON(
// 				http.StatusUnauthorized,
// 				config.GinErrorResponse(
// 					"Invalid API token",
// 					config.RestFulUnauthorized,
// 					config.RestFulCodeUnauthorized,
// 				),
// 			)
// 			return
// 		}

// 		// Valid token
// 		isValid := utils.VerifyAPIToken(privateKey, token.TokenHash)

// 		if !isValid {
// 			c.JSON(
// 				http.StatusUnauthorized,
// 				config.GinErrorResponse(
// 					"Invalid API token",
// 					config.RestFulUnauthorized,
// 					config.RestFulCodeUnauthorized,
// 				),
// 			)
// 			return
// 		}

// 		account, err := repository.GetAccountByID(token.AccountID)
// 		if err != nil {
// 			c.JSON(
// 				http.StatusInternalServerError,
// 				config.GinErrorResponse(
// 					err.Error(),
// 					config.RestFulUnauthorized,
// 					config.RestFulCodeUnauthorized,
// 				),
// 			)
// 			return
// 		}

// 		c.Set("account", account)

// 		c.Next()
// 	}
// }
