package service

import (
	"strings"
	"url-shortener/internal/model"
	"url-shortener/internal/repository"

	"github.com/google/uuid"
)

func GetListByUserID(userID uint) ([]model.URLResponse, error) {
	urls, err := repository.GetByUserID(userID)
	if err != nil {
		return nil, err
	}

	result := make([]model.URLResponse, len(urls))
	for i, url := range urls {
		result[i] = model.URLResponse{
			ShortCode: url.ShortCode,
			LongURL:   url.LongURL,
			CreatedAt: url.CreatedAt,
		}
	}

	return result, nil
}

func CreateShortURL(longURL string) (string, error) {
	code := strings.ReplaceAll(uuid.New().String(), "-", "")[:6]

	url := model.URL{
		ShortCode: code,
		LongURL:   longURL,
	}

	err := repository.CreateURL(&url)
	if err != nil {
		return "", err
	}

	return code, nil
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
