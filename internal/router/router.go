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
		AllowHeaders:     []string{"Authorization", "Content-Type", "Origin", "Accept", "X-Requested-With", "X-Public-Key", "X-Private-Key"},
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

	api := r.Group("/api/token")
	api.Use(middleware.APIMiddleware())
	{
		api.POST("/presign-upload", handler.APIPresignUpload)
		api.POST("/sign-upload/:uuid", handler.APISignUpload)
		api.POST("/complete-upload/:uuid", handler.APICompleteSingleUpload)
		api.POST("/complete-multipart-upload/:uuid", handler.APICompleteMultipartUpload)
	}

	share := r.Group("/api/share")
	share.Use(middleware.ShareFileMiddleware())
	{
		share.GET("/files/:code", handler.DownloadSharedFile)
	}

	protected := r.Group("/api/guard")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/auth-config", handler.AuthConfig)
		protected.POST("/change-password", handler.ChangePassword)

		/**
		* Presign, upload, complete upload router
		 */
		protected.POST("/presign-upload", handler.PresignUpload)
		protected.POST("/sign-upload/:uuid", handler.SignUpload)
		protected.POST("/complete-multipart-upload/:uuid", handler.CompleteMultipartUpload)
		protected.POST("/complete-single-upload/:uuid", handler.CompleteSingleUpload)

		protected.GET("/profile", handler.GetProfile)
		protected.PUT("/profile", handler.UpdateProfile)

		protected.GET("/tokens", handler.GetTokens)
		protected.POST("/tokens", handler.CreateToken)
		protected.DELETE("/tokens/:uuid", handler.DeleteToken)
		protected.PATCH("/tokens/:uuid/renew", handler.RenewToken)

		protected.GET("/logs", handler.GetActivityLogs)

		protected.GET("/folders", handler.GetFolders)
		protected.POST("/folders", handler.CreateFolder)
		protected.GET("/folders/:uuid", handler.GetFolderDetail)
		protected.DELETE("/folders/:uuid", handler.DeleteFolder)
		protected.PATCH("/folders/:uuid", handler.RenameFolder)

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
