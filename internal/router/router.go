package router

import (
	"url-shortener/internal/config"
	"url-shortener/internal/handler"
	"url-shortener/internal/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()
	cfg := config.GetConfig()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{cfg.ClientHost},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	r.SetTrustedProxies(nil)

	// Public routes
	r.POST("/auth/register", handler.Register)
	r.POST("/auth/login", handler.Login)
	r.POST("/auth/logout", handler.Logout)

	// Get plans for public
	r.GET("/api/public/plans", handler.GetPlans)

	// Public image route
	r.GET("/api/public/images/:code", handler.GetImageFile)

	// Short URL redirection route
	r.GET("/:code", handler.DirectURL)

	// Api token routes
	api := r.Group("/api/token")
	api.Use(middleware.APIMiddleware())
	{
		api.POST("/upload-image", handler.UseAPIUpImageHandler)
		api.DELETE("/delete-image", handler.UseAPIDeleteImageHandler)
	}

	// Shared file routes
	share := r.Group("/api/share")
	share.Use(middleware.ShareFileMiddleware())
	{
		// If the file is shared, it can be downloaded without authentication
		share.GET("/file/:uuid", handler.DownloadSharedFile)
	}

	// Protected routes
	protected := r.Group("/api/guard")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/config", handler.AuthConfig)

		protected.GET("/profile", handler.GetProfile)
		protected.PUT("/profile", handler.UpdateProfile)

		protected.GET("/plans", handler.ViewPlan)

		protected.GET("/tokens", handler.GetToken)
		protected.POST("/tokens", handler.CreateToken)
		protected.DELETE("/tokens/:uuid", handler.DeleteToken)

		/* Folder routes */
		protected.GET("/folders", handler.GetFolders)
		protected.POST("/folders", handler.CreateFolder)
		protected.DELETE("/folders/:uuid", handler.DeleteFolder)
		protected.PUT("/folders/:uuid", handler.UpdateFolder)

		/* File routes */
		protected.GET("/files", handler.GetFiles)
		protected.POST("/files", handler.UploadFile)
		protected.DELETE("/files/:uuid", handler.DeleteFile)
		// Share and unshare file routes - Download in self access and shared access
		protected.POST("/files/:uuid/share", handler.ShareFile)
		protected.POST("/files/:uuid/unshare", handler.UnShareFile)
		protected.GET("/file/:uuid/download", handler.DownloadFile)

		/* URL routes */
		protected.GET("/urls", handler.GetUrls)
		protected.POST("/urls", handler.CreateShortURL)
		protected.DELETE("/urls/:uuid", handler.DeleteURL)
	}

	return r
}
