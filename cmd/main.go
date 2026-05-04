package main

import (
	"context"
	"url-shortener/internal/config"
	"url-shortener/internal/model"
	"url-shortener/internal/router"
)

func main() {
	cfg := config.GetConfig()
	var port = cfg.Port

	config.InitPostgresClient()
	config.InitS3Client(context.Background())
	config.InitRedis()

	config.PostgresClient.AutoMigrate(
		&model.Plan{},
		&model.Account{},
		&model.AccountUsage{},
		&model.Profile{},
		&model.URL{},
		&model.Folder{},
		&model.File{},
		&model.Token{},
		&model.Session{},
		&model.Part{},
		&model.ActivityLog{},
	)

	// Init 3 plans: Free, Pro, Enterprise
	// Free plan: 1 GB storage, 20 URLs
	// Pro plan: 10 GB storage, 100 URLs
	// Enterprise plan: 100 GB storage, 1000 URLs
	config.PostgresClient.FirstOrCreate(&model.Plan{}, model.Plan{
		Name:         "Pro",
		Price:        100000,
		StorageLimit: 10 * 1024 * 1024 * 1024, // Bytes
		URLLimit:     100,
	})

	config.PostgresClient.FirstOrCreate(&model.Plan{}, model.Plan{
		Name:         "Enterprise",
		Price:        50000,
		StorageLimit: 5 * 1024 * 1024 * 1024, // Bytes
		URLLimit:     50,
	})

	config.PostgresClient.FirstOrCreate(&model.Plan{}, model.Plan{
		Name:         "Free",
		Price:        0,
		StorageLimit: 1 * 1024 * 1024 * 1024, // Bytes
		URLLimit:     20,
	})

	router := router.SetupRouter()
	router.Run(":" + port)
}
