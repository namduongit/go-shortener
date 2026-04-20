package service

import (
	"url-shortener/internal/config"
	"url-shortener/internal/model"
)

func GetFiles(accountID uint) ([]model.File, error) {
	var files []model.File
	err := config.PostgresClient.
		Where("account_id = ?", accountID).
		Preload("Folder").
		Find(&files).Error
	return files, err
}

func DeleteFileByUUID(accountID uint, uuid string) error {
	return config.PostgresClient.
		Where("account_id = ? AND uuid = ?", accountID, uuid).
		Delete(&model.File{}).Error
}
