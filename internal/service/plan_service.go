package service

import (
	"url-shortener/internal/model"
	"url-shortener/internal/repository"
)

func GetPlans() ([]model.Plan, error) {
	plans, err := repository.GetPlans()
	if err != nil {
		return nil, err
	}
	return plans, nil
}

func GetUsedStorageByAccountID(accountID uint) (int64, error) {
	return repository.GetTotalFileSizeByAccountID(accountID)
}

func GetUsedURLCountByAccountID(accountID uint) (int64, error) {
	return repository.CountURLsByAccountID(accountID)
}
