package main

import (
	"url-shortener/internal/config"
	"url-shortener/internal/model"
	"url-shortener/internal/router"
)

func main() {
	var port = config.GetConfig().Port

	config.InitDBClient()
	config.InitCLMiniO()

	config.DBClient.AutoMigrate(
		&model.Plan{},
		&model.Account{},
		&model.Profile{},
		&model.URL{},
		&model.Folder{},
		&model.File{},
		&model.Token{},
	)

	// Init 3 plans: Free, Pro, Enterprise
	// Free plan: 1 GB storage, 20 URLs
	// Pro plan: 10 GB storage, 100 URLs
	// Enterprise plan: 100 GB storage, 1000 URLs
	config.DBClient.FirstOrCreate(&model.Plan{}, model.Plan{
		Name:         "Pro",
		Price:        100000,
		StorageLimit: 10 * 1024 * 1024 * 1024,
		URLLimit:     100,
	})

	config.DBClient.FirstOrCreate(&model.Plan{}, model.Plan{
		Name:         "Enterprise",
		Price:        50000,
		StorageLimit: 5 * 1024 * 1024 * 1024,
		URLLimit:     50,
	})

	config.DBClient.FirstOrCreate(&model.Plan{}, model.Plan{
		Name:         "Free",
		Price:        0,
		StorageLimit: 1 * 1024 * 1024 * 1024,
		URLLimit:     20,
	})

	router := router.SetupRouter()
	router.Run(":" + port)
}
