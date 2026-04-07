package repository

import (
	"url-shortener/internal/config"
	"url-shortener/internal/model"
)

func GetPlans() ([]model.Plan, error) {
	var plans []model.Plan
	err := config.DBClient.Find(&plans).Error
	return plans, err
}

func GetPlanByUUID(uuid string) (*model.Plan, error) {
	var plan model.Plan
	err := config.DBClient.Where("uuid = ?", uuid).First(&plan).Error
	return &plan, err
}
