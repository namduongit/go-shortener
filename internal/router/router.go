package router

import (
	"fmt"
	"url-shortener/internal/handler"
	"url-shortener/internal/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	r.SetTrustedProxies(nil)

	// Public routes
	r.POST("/auth/register", handler.Register)
	r.POST("/auth/login", handler.Login)
	r.GET("/auth/config", handler.AuthConfig)
	r.POST("/auth/logout", handler.Logout)

	r.GET("/api/public/plans", handler.GetPlans)
	r.GET("/api/public/images/:code", handler.GetImageFile)
	r.GET("/api/public/urls/:code", func(c *gin.Context) {
		fmt.Println("Hehe")
	})

	// Protected routes
	protected := r.Group("/api/guard")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/profile", handler.GetProfile)
		protected.PUT("/profile", handler.UpdateProfile)

		protected.GET("/folders", handler.GetFolders)
		protected.POST("/folders", handler.CreateFolder)
		protected.DELETE("/folders/:id", handler.DeleteFolder)

		protected.GET("/files", handler.GetFiles)
		protected.POST("/files", handler.UploadFile)
		protected.DELETE("/files/:id", handler.DeleteFile)
		// protected.PATCH("/files/:id/folder", handler.MoveFile)

		protected.GET("/urls", handler.GetUrls)
		protected.POST("/urls", handler.CreateShortURL)
		protected.DELETE("/urls/:id", handler.DeleteURL)
	}

	return r
}
