package repository

import (
	"url-shortener/internal/config"
	"url-shortener/internal/model"

	"gorm.io/gorm"
)

func CreateFile(file *model.File) (*model.File, error) {
	err := config.DBClient.Create(file).Error
	return file, err
}

func GetFilesByAccountID(accountID uint) ([]model.File, error) {
	var files []model.File
	err := config.DBClient.
		Preload("Folder").
		Where("account_id = ?", accountID).
		Order("created_at DESC").
		Find(&files).Error
	return files, err
}

func GetFileByID(fileID uint) (*model.File, error) {
	var file model.File
	err := config.DBClient.
		Where("id = ?", fileID).
		First(&file).Error
	if err != nil {
		return nil, err
	}
	return &file, nil
}

func GetFileByIDAndAccountID(fileID uint, accountID uint) (*model.File, error) {
	var file model.File
	err := config.DBClient.Where("id = ? AND account_id = ?", fileID, accountID).First(&file).Error
	if err != nil {
		return nil, err
	}

	return &file, nil
}

func UpdateFileFolder(fileID uint, accountID uint, folderID *uint) error {
	updates := map[string]any{"folder_id": folderID}
	result := config.DBClient.Model(&model.File{}).Where("id = ? AND account_id = ?", fileID, accountID).Updates(updates)
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}

func DeleteFileByID(fileID uint, accountID uint) error {
	result := config.DBClient.Where("id = ? AND account_id = ?", fileID, accountID).Delete(&model.File{})
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}
