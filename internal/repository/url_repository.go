package repository

import (
	"url-shortener/internal/config"
	"url-shortener/internal/model"
)

func CreateURL(url *model.URL) error {
	return config.DBClient.Create(url).Error
}

func GetURLsFromAccountID(id uint) ([]model.URL, error) {
	var urls []model.URL
	err := config.DBClient.Where("account_id = ?", id).Find(&urls).Error

	return urls, err
}

func GetURLByUUID(uuid string) (*model.URL, error) {
	var url model.URL
	err := config.DBClient.Where("uuid = ?", uuid).First(&url).Error

	return &url, err
}

func GetURLByShortCode(code string) (*model.URL, error) {
	var url model.URL
	err := config.DBClient.Where("short_code = ?", code).First(&url).Error

	return &url, err
}

func DeleteURLByUUID(uuid string) error {
	err := config.DBClient.Where("uuid = ?", uuid).Delete(&model.URL{}).Error
	return err
}

func CountURLsByAccountID(accountID uint) (int64, error) {
	var total int64
	err := config.DBClient.Model(&model.URL{}).
		Where("account_id = ?", accountID).
		Count(&total).Error

	return total, err
}
