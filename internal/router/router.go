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
		AllowOrigins: []string{cfg.ClientHost},
		// AllowOrigins:     []string{"https://gms-cloud-client.namduong.dev"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	r.SetTrustedProxies(nil)

	r.POST("/auth/register", handler.Register)
	r.POST("/auth/login", handler.Login)
	r.POST("/auth/logout", handler.Logout)
	r.POST("/auth/forgot-password", handler.ForgotPassword)
	r.GET("/auth/activation", handler.Activation)
	r.POST("/auth/resend-activation-email", handler.ResendActivationEmail)

	r.GET("/:code", handler.DirectURL)

	publicGroup := r.Group("/api/public")
	{
		publicGroup.GET("/plans", handler.GetPlans)
		publicGroup.GET("/images/:code", handler.ShowImage)
	}

	// api := r.Group("/api/token")
	// api.Use(middleware.APIMiddleware())
	// {
	// 	api.POST("/upload-image", handler.UseAPIUpImageHandler)
	// 	api.DELETE("/delete-image", handler.UseAPIDeleteImageHandler)
	// }

	// share := r.Group("/api/share")
	// share.Use(middleware.ShareFileMiddleware())

	protected := r.Group("/api/guard")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/auth-config", handler.AuthConfig)
		protected.POST("/change-password", handler.ChangePassword)

		protected.POST("/presign-upload", handler.PresignUpload)
		protected.POST("/sign-upload/:uuid", handler.SignUpload)
		protected.POST("/upload-part/:uuid", handler.UploadPart)
		protected.POST("/complete-upload/:uuid", handler.CompleteUpload)

		// protected.GET("/profile", handler.GetProfile)
		// protected.PUT("/profile", handler.UpdateProfile)

		// protected.GET("/tokens", handler.GetToken)
		// protected.POST("/tokens", handler.CreateToken)
		// protected.DELETE("/tokens/:uuid", handler.DeleteToken)

		protected.GET("/folders", handler.GetFolders)
		protected.POST("/folders", handler.CreateFolder)
		// protected.DELETE("/folders/:uuid", handler.DeleteFolder)
		// protected.PUT("/folders/:uuid", handler.UpdateFolder)

		protected.GET("/files", handler.GetFiles)
		protected.DELETE("/files/:uuid", handler.DeleteFile)
		protected.POST("/files/:uuid/share", handler.ShareFile)
		protected.POST("/files/:uuid/unshare", handler.UnShareFile)
		protected.GET("/file/:uuid/download", handler.DownloadFile)

		protected.GET("/short-urls", handler.GetShortURLs)
		protected.POST("/short-urls", handler.CreateShortURL)
		protected.DELETE("/short-urls/:uuid", handler.DeleteShortURL)
	}

	return r
}
