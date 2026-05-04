package service

import (
	"errors"
	"url-shortener/internal/config"
	"url-shortener/internal/model"
)

// GetFileByUUID returns a file owned by the account with the given UUID.
func GetFileByUUID(accountID uint, uuid string) (*model.File, error) {
	var file model.File
	err := config.PostgresClient.
		Where("account_id = ? AND uuid = ?", accountID, uuid).
		Preload("Folder").
		First(&file).Error
	if err != nil {
		return nil, errors.New("file not found")
	}
	return &file, nil
}

// GetSharedFileByUUID looks up any shared file by its UUID (no account filter).
func GetSharedFileByUUID(uuid string) (*model.File, error) {
	var file model.File
	err := config.PostgresClient.
		Where("uuid = ?", uuid).
		Preload("Folder").
		First(&file).Error
	if err != nil {
		return nil, errors.New("file not found")
	}
	return &file, nil
}

// ShareFileByUUID sets the IsShared flag on a file.
// shared=true  → share the file
// shared=false → unshare the file
func ShareFileByUUID(accountID uint, uuid string, shared bool) (*model.File, error) {
	var file model.File
	if err := config.PostgresClient.
		Where("account_id = ? AND uuid = ?", accountID, uuid).
		Preload("Folder").
		First(&file).Error; err != nil {
		return nil, errors.New("file not found")
	}

	file.IsShared = shared
	if err := config.PostgresClient.Save(&file).Error; err != nil {
		return nil, err
	}

	return &file, nil
}
