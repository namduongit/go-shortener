package middleware

import (
	"net/http"
	"url-shortener/internal/config"
	"url-shortener/internal/service"

	"github.com/gin-gonic/gin"
)

// ShareFileMiddleware verifies that the file referenced by :code exists and is publicly shared.
// It stores the file model in the context under key "sharedFile" for downstream handlers.
func ShareFileMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		fileUUID := c.Param("code")
		if fileUUID == "" {
			c.AbortWithStatusJSON(http.StatusBadRequest, config.GinErrorResponse(
				"File code is required",
				config.RestFulInvalid,
				config.RestFulCodeInvalid,
			))
			return
		}

		sharedFile, err := service.GetSharedFileByUUID(fileUUID)
		if err != nil || sharedFile == nil {
			c.AbortWithStatusJSON(http.StatusNotFound, config.GinErrorResponse(
				"File not found",
				config.RestFulNotFound,
				config.RestFulCodeNotFound,
			))
			return
		}

		if !sharedFile.IsShared {
			c.AbortWithStatusJSON(http.StatusForbidden, config.GinErrorResponse(
				"File is not publicly shared",
				config.RestFulForbidden,
				config.RestFulCodeForbidden,
			))
			return
		}

		c.Set("sharedFile", sharedFile)
		c.Next()
	}
}
