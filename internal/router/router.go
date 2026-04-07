package router

import (
	"net/url"
	"strings"
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

	r.GET("/api/public/plans", handler.GetPlans)
	r.GET("/api/public/images/:code", handler.GetImageFile)
	// Endpoint configuration from environment

	// Protected routes
	protected := r.Group("/api/guard")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/file/:uuid/download", handler.DownloadFile)
		protected.GET("/url/:code/direct", handler.DirectURL)

		protected.GET("/config", handler.AuthConfig)

		protected.GET("/profile", handler.GetProfile)
		protected.PUT("/profile", handler.UpdateProfile)

		protected.GET("/plans", handler.ViewPlan)

		/* Folder routes */
		protected.GET(
			"/folders",
			handler.GetFolders,
		)
		protected.POST(
			"/folders",
			handler.CreateFolder,
		)
		protected.DELETE(
			"/folders/:uuid",
			handler.DeleteFolder,
		)

		/* File routes */
		protected.GET(
			"/files",
			handler.GetFiles,
		)
		protected.POST(
			"/files",
			handler.UploadFile,
		)
		protected.DELETE(
			"/files/:uuid",
			handler.DeleteFile,
		)

		/* URL routes */
		protected.GET(
			"/urls",
			handler.GetUrls,
		)
		protected.POST(
			"/urls",
			handler.CreateShortURL,
		)
		protected.DELETE(
			"/urls/:uuid",
			handler.DeleteURL,
		)
	}

	return r
}

func normalizeEndpointPath(raw string) string {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return ""
	}

	if strings.HasPrefix(raw, "/") {
		return strings.TrimRight(raw, "/")
	}

	u, err := url.Parse(raw)
	if err != nil {
		return ""
	}

	path := strings.TrimSpace(u.Path)
	if path == "" || path == "/" {
		return ""
	}

	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}

	return strings.TrimRight(path, "/")
}
