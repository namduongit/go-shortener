package repository

import (
	"url-shortener/internal/config"
	"url-shortener/internal/model"
)

func CreateFile(file *model.File) error {
	err := config.DBClient.Create(file).Error
	return err
}

func GetFilesFromAccountID(accountID uint) ([]model.File, error) {
	var files []model.File
	err := config.DBClient.
		Preload("Folder").
		Where("account_id = ?", accountID).
		Order("created_at DESC").
		Find(&files).Error

	return files, err
}

func GetFileByUUID(uuid string) (*model.File, error) {
	var file model.File
	err := config.DBClient.
		Where("uuid = ?", uuid).
		First(&file).Error

	if err != nil {
		return nil, err
	}

	return &file, nil
}

func GetFileByUUIDAndAccountID(uuid string, accountID uint) (*model.File, error) {
	var file model.File
	err := config.DBClient.Where("uuid = ? AND account_id = ?", uuid, accountID).First(&file).Error
	if err != nil {
		return nil, err
	}

	return &file, nil
}

func DeleteFileByUUIDFromAccountID(uuid string, accountID uint) error {
	err := config.DBClient.Where("uuid = ? AND account_id = ?", uuid, accountID).Delete(&model.File{}).Error

	return err
}

func GetTotalFileSizeByAccountID(accountID uint) (int64, error) {
	var total int64
	err := config.DBClient.Model(&model.File{}).
		Where("account_id = ?", accountID).
		Select("COALESCE(SUM(size), 0)").
		Scan(&total).Error

	return total, err
}
