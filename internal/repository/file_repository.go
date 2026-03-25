package repository

import (
	"url-shortener/internal/config"
	"url-shortener/internal/model"

	"gorm.io/gorm"
)

func CreateFile(file *model.File) error {
	return config.DB.Create(file).Error
}

func GetAllFiles() ([]model.File, error) {
	var files []model.File
	err := config.DB.Order("created_at DESC").Find(&files).Error
	return files, err
}

func GetFilesByUserID(userID uint) ([]model.File, error) {
	var files []model.File
	err := config.DB.
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&files).Error
	return files, err
}

func GetTotalSizeByUserID(userID uint) (int64, error) {
	var total int64
	err := config.DB.
		Model(&model.File{}).
		Where("user_id = ?", userID).
		Select("COALESCE(SUM(size), 0)").
		Scan(&total).Error
	return total, err
}

func GetFileByStoredName(userID uint, storedName string) (*model.File, error) {
	var file model.File
	err := config.DB.
		Where("user_id = ? AND stored_name = ?", userID, storedName).
		First(&file).Error
	if err != nil {
		return nil, err
	}
	return &file, nil
}

func DeleteFileByStoredName(userID uint, storedName string) error {
	result := config.DB.
		Where("user_id = ? AND stored_name = ?", userID, storedName).
		Delete(&model.File{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}
