package service

import (
	"strings"
	"url-shortener/internal/config"
	"url-shortener/internal/model"

	"github.com/google/uuid"
)

func GetShortURLs(accountID uint) ([]model.URL, error) {
	var urls []model.URL
	err := config.PostgresClient.
		Where("account_id = ?", accountID).
		Find(&urls).Error
	return urls, err
}

func CreateShortURL(accountID uint, longURL string, description string) (*model.URL, error) {
	code := strings.ReplaceAll(uuid.New().String(), "-", "")[:6]

	url := model.URL{
		ShortCode:   code,
		LongURL:     longURL,
		Description: description,
		AccountID:   accountID,
	}

	err := config.PostgresClient.Create(&url).Error
	if err != nil {
		return nil, err
	}

	return &url, nil
}

func GetShortURLByCode(code string) (*model.URL, error) {
	var url model.URL
	err := config.PostgresClient.
		Where("short_code = ?", code).
		First(&url).Error
	if err != nil {
		return nil, err
	}
	return &url, nil
}

func DeleteShortURLByUUID(accountID uint, uuid string) error {
	return config.PostgresClient.
		Where("account_id = ? AND uuid = ?", accountID, uuid).
		Delete(&model.URL{}).Error
}
