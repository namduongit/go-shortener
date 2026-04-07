package repository

import (
	"url-shortener/internal/config"
	"url-shortener/internal/model"
)

func CreateAccount(account *model.Account) error {
	return config.DBClient.Create(account).Error
}

func GetAccountByEmail(email string) (*model.Account, error) {
	var account model.Account
	if err := config.DBClient.Preload("Plan").Where("email = ?", email).First(&account).Error; err != nil {
		return nil, err
	}
	return &account, nil
}

func GetAccountByUUID(uuid string) (*model.Account, error) {
	var account model.Account
	if err := config.DBClient.Preload("Plan").Where("uuid = ?", uuid).First(&account).Error; err != nil {
		return nil, err
	}
	return &account, nil
}

func GetAccountByID(id uint) (*model.Account, error) {
	var account model.Account
	if err := config.DBClient.Preload("Plan").Where("id = ?", id).First(&account).Error; err != nil {
		return nil, err
	}
	return &account, nil
}
