package service

import (
	"errors"
	"time"
	"url-shortener/internal/config"
	"url-shortener/internal/model"
	"url-shortener/internal/utils"
)

func GetTokensByAccountID(accountID uint) ([]model.Token, error) {
	var tokens []model.Token
	if err := config.PostgresClient.
		Where("account_id = ?", accountID).
		Order("created_at DESC").
		Find(&tokens).Error; err != nil {
		return nil, err
	}
	return tokens, nil
}

func CreateToken(accountID uint, name string, days *int) (*model.Token, string, error) {
	// Time is day [1, 7, 30, 90]
	var expiresAt *time.Time

	if days != nil && *days > 0 {
		expiration := time.Now().AddDate(0, 0, *days)
		expiresAt = &expiration
	}

	tokenPair, err := utils.GenerateAPITokenPair()
	if err != nil {
		return nil, "", err
	}

	token := model.Token{
		AccountID: accountID,
		Name:      name,
		Token:     tokenPair.PublicToken,
		TokenHash: tokenPair.PrivateTokenHash,
		ExpiresAt: expiresAt,
	}

	if err := config.PostgresClient.Create(&token).Error; err != nil {
		return nil, "", err
	}

	return &token, tokenPair.PrivateToken, nil
}

func DeleteToken(uuid string, accountID uint) error {
	result := config.PostgresClient.
		Where("uuid = ? AND account_id = ?", uuid, accountID).
		Delete(&model.Token{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("token not found")
	}
	return nil
}

// RenewToken gia hạn token thêm N ngày (mặc định 30 nếu daysToAdd=0)
func RenewToken(uuid string, accountID uint, daysToAdd int) (*model.Token, error) {
	if daysToAdd <= 0 {
		daysToAdd = 30
	}
	var token model.Token
	if err := config.PostgresClient.
		Where("uuid = ? AND account_id = ?", uuid, accountID).
		First(&token).Error; err != nil {
		return nil, errors.New("token not found")
	}

	base := time.Now()
	if token.ExpiresAt != nil && token.ExpiresAt.After(base) {
		base = *token.ExpiresAt
	}
	newExp := base.AddDate(0, 0, daysToAdd)
	token.ExpiresAt = &newExp

	if err := config.PostgresClient.Save(&token).Error; err != nil {
		return nil, err
	}
	return &token, nil
}

