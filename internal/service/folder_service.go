package service

import (
	"url-shortener/internal/config"
	"url-shortener/internal/model"
)

func GetFolders(accountID uint) ([]model.Folder, error) {
	var folders []model.Folder
	err := config.PostgresClient.
		Where("account_id = ?", accountID).
		Find(&folders).Error
	return folders, err
}
