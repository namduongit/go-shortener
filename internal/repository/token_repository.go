package repository

import (
	"url-shortener/internal/config"
	"url-shortener/internal/model"
)

func CreateToken(token *model.Token) error {
	return config.DBClient.Create(token).Error
}

func GetTokensFromAccountID(accountID uint) ([]model.Token, error) {
	var tokens []model.Token
	err := config.DBClient.
		Where("account_id = ?", accountID).
		Order("created_at DESC").
		Find(&tokens).Error

	return tokens, err
}

func DeleteTokenByUUID(uuid string) error {
	return config.DBClient.
		Where("uuid = ?", uuid).
		Delete(&model.Token{}).Error
}
