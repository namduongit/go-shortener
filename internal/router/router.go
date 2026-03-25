package router

import (
	"url-shortener/internal/handler"
	"url-shortener/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()
	r.SetTrustedProxies(nil)

	// Public auth routes
	r.POST("/register", handler.Register)
	r.POST("/login", handler.Login)

	// Protected routes
	auth := r.Group("/")
	auth.Use(middleware.AuthMiddleware())
	{
		// URL routes
		auth.POST("/shorten", handler.CreateShortURL)
		auth.GET("/urls", handler.GetAllURLs)
		auth.DELETE("/urls/:code", handler.DeleteURL)

		// File routes - uploads require auth
		auth.POST("/upload", handler.UploadFile)
	}

	// Public routes
	r.GET("/files/:filename", handler.GetFile)
	r.GET("/:code", handler.RedirectURL)

	return r
}
