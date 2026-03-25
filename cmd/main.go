package main

import (
	"fmt"
	"url-shortener/internal/config"
	"url-shortener/internal/model"
	"url-shortener/internal/router"
)

func main() {
	var port = config.GetConfig().PORT
	var host = config.GetConfig().HOST

	config.ConnectDB()

	config.DB.AutoMigrate(
		&model.Plan{},
		&model.User{},
		&model.URL{},
		&model.File{},
	)

	config.DB.FirstOrCreate(&model.Plan{}, model.Plan{
		Name:         "Free",
		StorageLimit: 10 * 1024 * 1024 * 1024,
		URLLimit:     20,
	})

	router := router.SetupRouter()
	fmt.Println("Server running on: ", host, ":", port)
	router.Run(":" + port)
}
