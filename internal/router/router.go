package router

import (
	"url-shortener/internal/handler"
	"url-shortener/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()
	r.SetTrustedProxies(nil)

	authGroup := r.Group("/auth")
	{
		authGroup.POST("/register", handler.Register)
		authGroup.POST("/login", handler.Login)
	}

	urlGroup := r.Group("/api/urls")
	urlGroup.Use(middleware.AuthMiddleware())
	{
		urlGroup.GET("/", handler.GetUrls)

		urlGroup.POST("/", handler.CreateShortURL)

		urlGroup.GET("/:code", handler.RedirectURL)

		urlGroup.DELETE("/:code", handler.DeleteURL)
	}

	fileGroup := r.Group("/api/files")
	fileGroup.Use(middleware.AuthMiddleware())
	{
		fileGroup.GET("/", handler.GetFiles)
		fileGroup.POST("/", handler.UploadFile)
		fileGroup.GET("/:filename", handler.GetFile)
		fileGroup.DELETE("/:filename", handler.DeleteFile)
	}

	return r
}
