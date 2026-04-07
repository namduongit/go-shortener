package service

import (
	"errors"
	"strings"
	"url-shortener/internal/config"
	"url-shortener/internal/model"
	"url-shortener/internal/repository"

	"golang.org/x/crypto/bcrypt"
)

func Register(email, password string) (*model.Account, error) {
	hashed, _ := bcrypt.GenerateFromPassword([]byte(password), 10)

	var plan model.Plan
	config.DBClient.Where("name = ?", "Free").First(&plan)

	account := model.Account{
		Email:    email,
		Password: string(hashed),
		PlanID:   plan.ID,
		Role:     model.RoleUser,
	}

	if err := repository.CreateAccount(&account); err != nil {
		if strings.Contains(err.Error(), "duplicate") {
			return nil, errors.New("Email already exists")
		}
		return nil, err
	}

	account.Plan = plan

	profile := model.Profile{
		Username:    account.UUID.String(),
		AvatarURL:   "",
		FullName:    "",
		CompanyName: "",
		Address:     "",
		Phone:       "",

		AccountID: account.ID,
	}

	go repository.CreateProfile(&profile)

	return &account, nil
}

func Login(email string, password string) (*model.Account, error) {
	account, err := repository.GetAccountByEmail(email)
	if err != nil {
		if strings.Contains(err.Error(), "record not found") {
			return nil, errors.New("Email does not exist")
		}
		return nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(account.Password), []byte(password)); err != nil {
		return nil, errors.New("Password is incorrect")
	}

	return account, nil
}

func GetAccountByUUID(uuid string) (*model.Account, error) {
	account, err := repository.GetAccountByUUID(uuid)
	if err != nil && strings.Contains(err.Error(), "record not found") {
		return nil, errors.New("Not found account")
	}
	return account, nil
}
