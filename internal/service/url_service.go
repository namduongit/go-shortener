package service

import (
	"errors"
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

func GetListURLsByAccountID(accountID uint) ([]model.URL, error) {
	urls, err := repository.GetByAccountID(accountID)
	if err != nil {
		return nil, err
	}

	return urls, nil
}

func GetLongURL(code string) (string, error) {
	url, err := repository.GetByShortCode(code)
	if err != nil {
		return "", err
	}

	return url.LongURL, nil
}

func DeleteURL(code string) error {
	return repository.DeleteByShortCode(code)
}

func GetTotalAmountOfURLsByaccountID(accountID uint) (int64, error) {
	var count int64
	err := config.DBClient.Model(&model.URL{}).Where("account_id = ?", accountID).Count(&count).Error
	return count, err
}

func DeleteURLByID(accountID uint, urlID uint) error {
	err := repository.DeleteByIDAndAccountID(urlID, accountID)
	if err != nil {
		if strings.Contains(err.Error(), "record not found") {
			return errors.New("URL not found")
		}

		return err
	}

	return nil
}
