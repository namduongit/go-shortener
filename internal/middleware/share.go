package middleware

import (
	"net/http"
	"url-shortener/internal/config"
	"url-shortener/internal/service"

	"github.com/gin-gonic/gin"
)

func ShareFileMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		fileUUID := c.Param("uuid")
		if fileUUID != "" {
			sharedFile, err := service.GetSharedFileByUUID(fileUUID)
			if err == nil && sharedFile != nil && sharedFile.IsShared {
				c.Next()
				return
			}
		}

		c.AbortWithStatusJSON(http.StatusUnauthorized, config.GinErrorResponse(
			config.RequireAuthentication,
			config.RestFulInvalid,
			config.RestFulCodeInvalid,
		))
	}
}
