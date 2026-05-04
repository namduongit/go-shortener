package service

import (
	"url-shortener/internal/config"
	"url-shortener/internal/model"
)

// GetProfileByAccountID returns the Profile record for a given account ID.
func GetProfileByAccountID(accountID uint) (*model.Profile, error) {
	var profile model.Profile
	err := config.PostgresClient.Where("account_id = ?", accountID).First(&profile).Error
	return &profile, err
}

// UpdateProfile saves the updated profile fields to the database.
func UpdateProfile(profile *model.Profile) error {
	return config.PostgresClient.Save(profile).Error
}
