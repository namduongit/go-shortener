package repository

import (
	"url-shortener/internal/config"
	"url-shortener/internal/model"
)

func CreateProfile(profile *model.Profile) (*model.Profile, error) {
	err := config.DBClient.Create(profile).Error
	return profile, err
}

func GetProfileFromAccountID(id uint) (*model.Profile, error) {
	var profile model.Profile
	err := config.DBClient.Where("account_id = ?", id).First(&profile).Error

	return &profile, err
}

func UpdateProfile(profile *model.Profile) (*model.Profile, error) {
	err := config.DBClient.Save(profile).Error
	return profile, err
}
