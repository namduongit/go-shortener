package repository

import (
	"url-shortener/internal/config"
	"url-shortener/internal/model"

	"gorm.io/gorm"
)

func GetByUserID(id uint) ([]model.URL, error) {
	var urls []model.URL
	err := config.DB.Where("user_id = ?", id).Find(&urls).Error
	return urls, err
}

func CreateURL(url *model.URL) error {
	return config.DB.Create(url).Error
}

func GetByShortCode(code string) (*model.URL, error) {
	var url model.URL
	err := config.DB.Where("short_code = ?", code).First(&url).Error
	return &url, err
}

func DeleteByShortCode(code string) error {
	result := config.DB.Where("short_code = ?", code).Delete(&model.URL{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}
