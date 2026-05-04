package service

import (
	"context"
	"errors"
	"url-shortener/internal/config"
	"url-shortener/internal/model"

	"gorm.io/gorm"
)

var cfg = config.GetConfig()

func GetFolders(accountID uint) ([]model.Folder, error) {
	var folders []model.Folder
	err := config.PostgresClient.
		Where("account_id = ?", accountID).
		Find(&folders).Error
	return folders, err
}

func GetFolderByUUID(uuid string) (*model.Folder, error) {
	if uuid == "" {
		return nil, errors.New("Skip query")
	}
	var folder model.Folder
	err := config.PostgresClient.Where("uuid = ?", uuid).First(&folder).Error

	return &folder, err
}

func GetFilesByFolderUUID(accountID uint, folderUUID string) ([]model.File, error) {
	var files []model.File
	err := config.PostgresClient.
		Where("account_id = ? AND folder_id = (SELECT id FROM folders WHERE uuid = ?)", accountID, folderUUID).
		Preload("Folder").
		Find(&files).Error
	return files, err
}

func CreateFolder(accountID uint, name string) (*model.Folder, error) {
	var folder = model.Folder{
		Name:      name,
		AccountID: accountID,
		TotalFile: 0,
		TotalSize: 0,
	}

	err := config.PostgresClient.Create(&folder).Error

	return &folder, err
}

/**
 * * Delete a folder and all its files, reclaiming the used storage quota.
 * ? @param accountID uint
 * ? @param folder *model.Folder
 * ? @return error
 * * Flow: Retrieve all files in folder -> Sum their sizes -> Delete files ->
 *         Reduce UsedStorage in AccountUsage -> Delete folder (cascade via DB)
 */
func DeleteFolder(accountID uint, folder *model.Folder) error {
	return config.PostgresClient.Transaction(func(tx *gorm.DB) error {
		// Get all files in this folder to calculate total size to reclaim
		var files []model.File
		if err := tx.Where("account_id = ? AND folder_id = ?", accountID, folder.ID).Find(&files).Error; err != nil {
			return err
		}

		var totalSize uint64
		for _, f := range files {
			totalSize += f.Size
		}

		// Delete all files in the folder in background
		go func(files []model.File) {
			for _, f := range files {
				config.DeleteObject(context.Background(), cfg.MiniOFinalBucketName, f.StorageKey)
			}
		}(files)

		// Delete all files in the folder
		if err := tx.Where("account_id = ? AND folder_id = ?", accountID, folder.ID).Delete(&model.File{}).Error; err != nil {
			return err
		}

		// Reclaim storage quota (decrease UsedStorage)
		if totalSize > 0 {
			if err := tx.Model(&model.AccountUsage{}).
				Where("account_id = ?", accountID).
				UpdateColumn("used_storage", gorm.Expr("GREATEST(used_storage - ?, 0)", totalSize)).Error; err != nil {
				return err
			}
		}

		// Delete the folder itself
		return tx.Delete(folder).Error
	})
}

/**
 * * Rename a folder
 * ? @param folder *model.Folder
 * ? @param newName string
 * ? @return error
 */
func RenameFolder(folder *model.Folder, newName string) error {
	folder.Name = newName
	return config.PostgresClient.Model(folder).Update("name", newName).Error
}
