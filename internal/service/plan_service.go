package service

import (
	"url-shortener/internal/config"
	"url-shortener/internal/model"
)

func GetPlans() ([]model.Plan, error) {
	var plans []model.Plan
	err := config.PostgresClient.Find(&plans).Error
	return plans, err
}
