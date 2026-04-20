package service

import (
	"time"
	"url-shortener/internal/config"
	"url-shortener/internal/model"
	"url-shortener/internal/utils"
)

func GetTokensByAccountID(accountID uint) ([]model.Token, error) {
	var tokens []model.Token
	if err := config.PostgresClient.Where("account_id = ?", accountID).Find(&tokens).Error; err != nil {
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

func DeleteToken(uuid string) error {
	return config.PostgresClient.Where("uuid = ?", uuid).Delete(&model.Token{}).Error
}
