package service

import (
	"context"
	"errors"
	"log"
	"strings"
	"time"
	"url-shortener/internal/config"
	"url-shortener/internal/model"
	"url-shortener/internal/utils"

	"golang.org/x/crypto/bcrypt"
)

/**
* * Register Account By Email and Password
* ? @param email string
* ? @param password string
* ? @return *model.Account, error
* * Flow: Get Free Plan -> Create Account with Account Usage Free and Profile with default value -> Return Account
 */
func RegisterAccount(email, password string) (*model.Account, error) {
	var plan model.Plan
	config.PostgresClient.Where("name = ?", "Free").First(&plan)

	account := model.Account{
		Email:    email,
		Password: password,
		PlanID:   plan.ID,
		Usage: model.AccountUsage{
			QuotaBytes:    plan.StorageLimit,
			UsedStorage:   0,
			ReservedBytes: 0,
		},
		Profile: model.Profile{
			AvatarURL:   "",
			FullName:    "",
			CompanyName: "",
			Address:     "",
			Phone:       "",
		},
		Role: model.RoleUser,
	}

	if err := config.PostgresClient.Create(&account).Error; err != nil {
		if strings.Contains(err.Error(), "duplicate") {
			return nil, errors.New("Email already exists")
		}
		return nil, err
	}

	account.Plan = plan

	// Send verification email
	go func() {
		token, err := utils.GenerateActivationToken(account.Email)
		if err != nil {
			log.Println("Generate activation token failed: ", err.Error())
			return
		}
		// Save with Redis with expiration time 24h
		config.RedisClient.Set(context.Background(), account.Email, token, 24*time.Hour)
		// Reference old token for resend activation email
		config.PostgresClient.Model(&model.Account{}).Where("email = ?", account.Email).Update("old_activation_token", token)
		// Send email with token
		if err := utils.SendActivationEmail(account.Email, token); err != nil {
			log.Println("Send activation email failed: ", err.Error())
		}

	}()

	return &account, nil
}

/**
* * Login Account By Email and Password
* ? @param email string
* ? @param password string
* ? @return *model.Account, error
* * Flow: Get Account by Email -> Compare Password -> Return Account
 */
func LoginAccount(email string, password string) (*model.Account, error) {
	var account model.Account
	if err := config.PostgresClient.Where("email = ?", email).Preload("Plan").First(&account).Error; err != nil {
		if strings.Contains(err.Error(), "record not found") {
			return nil, errors.New("Email does not exist")
		}
		return nil, err
	}

	if account.Status != model.StatusActive {
		return nil, errors.New("Account is not activated")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(account.Password), []byte(password)); err != nil {
		return nil, errors.New("Password is incorrect")
	}

	return &account, nil
}

func GetAccountByUUIDString(uuid string) (*model.Account, error) {
	var account model.Account
	if err := config.PostgresClient.Where("uuid = ?", uuid).Preload("Plan").First(&account).Error; err != nil {
		if strings.Contains(err.Error(), "record not found") {
			return nil, errors.New("Account does not exist")
		}
		return nil, err
	}

	return &account, nil
}

func ReloadAccount(account *model.Account) error {
	if err := config.PostgresClient.Where("id = ?", account.ID).
		Preload("Plan").First(account).
		Preload("Usage").First(account).
		Error; err != nil {
		if strings.Contains(err.Error(), "record not found") {
			return errors.New("Account does not exist")
		}
		return err
	}

	return nil
}

/**
* * Update account password
* ? @param account *model.Account
* ? @param newPassword string
* ? @return error
* * Flow: Hash new password -> Update account password and version -> Save account
 */
func UpdateAccountPassword(account *model.Account, newPassword string) error {
	hashed, err := bcrypt.GenerateFromPassword([]byte(newPassword), 10)
	if err != nil {
		return err
	}

	account.Password = string(hashed)
	account.Version += 1

	if err := config.PostgresClient.Save(account).Error; err != nil {
		return err
	}

	return nil
}

/**
* * Activate account by email and token
* ? @param email string
* ? @param token string
* ? @return error
* * Flow: Check in redis -> If token valid, activate account and delete token in redis -> If token invalid, return error
 */
func ActivateAccount(email string, token string) error {
	var account model.Account
	if err := config.PostgresClient.Where("email = ?", email).First(&account).Error; err != nil {
		return err
	}

	if account.Status == model.StatusActive {
		return errors.New("Account already activated")
	}

	val, err := config.RedisClient.Get(context.Background(), email).Result()
	if err != nil {
		return err
	}

	if utils.CompareActivationToken(val, email) {
		if err := config.PostgresClient.Model(&model.Account{}).Where("email = ?", email).Update("status", model.StatusActive).Error; err != nil {
			return err
		}
		config.RedisClient.Del(context.Background(), email)
		return nil
	}

	return errors.New("Invalid activation token")
}

func ResendActivationEmail(email string, oldToken string) error {
	if !utils.CompareActivationToken(oldToken, email) {
		return errors.New("Invalid activation token")
	}

	token, err := utils.GenerateActivationToken(email)
	if err != nil {
		return err
	}
	// Save with Redis with expiration time 24h
	config.RedisClient.Set(context.Background(), email, token, 24*time.Hour)
	// Send email with token
	if err := utils.SendActivationEmail(email, token); err != nil {
		return err
	}

	return nil
}
