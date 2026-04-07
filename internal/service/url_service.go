package service

import (
	"strings"
	"url-shortener/internal/config"
	"url-shortener/internal/model"
	"url-shortener/internal/repository"

	"github.com/google/uuid"
)

var cfg = config.GetConfig()

func CreateShortURL(accountID uint, longURL string, description string) (*model.URL, error) {
	code := strings.ReplaceAll(uuid.New().String(), "-", "")[:6]

	url := model.URL{
		ShortCode:   code,
		LongURL:     longURL,
		Description: description,
		AccountID:   accountID,
	}

	err := repository.CreateURL(&url)
	if err != nil {
		return nil, err
	}

	return &url, nil
}

func GetURLsFromAccountID(accountID uint) ([]model.URL, error) {
	urls, err := repository.GetURLsFromAccountID(accountID)

	return urls, err
}

func GetURLByUUID(uuid string) (*model.URL, error) {
	url, err := repository.GetURLByUUID(uuid)

	return url, err
}

func GetURLByShortCode(code string) (*model.URL, error) {
	url, err := repository.GetURLByShortCode(code)

	return url, err
}

func DeleteURLByUUID(uuid string) error {
	err := repository.DeleteURLByUUID(uuid)

	return err
}
