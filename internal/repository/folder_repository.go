package repository

import (
	"url-shortener/internal/config"
	"url-shortener/internal/model"
)

func CreateFolder(folder *model.Folder) error {
	return config.DBClient.Create(folder).Error
}

func GetFoldersFromAccountID(accountID uint) ([]model.Folder, error) {
	var folders []model.Folder
	err := config.DBClient.
		Where("account_id = ?", accountID).
		Order("created_at DESC").
		Find(&folders).Error

	return folders, err
}

func GetFolderByUUID(uuid string) (*model.Folder, error) {
	var folder model.Folder
	err := config.DBClient.
		Where("uuid = ?", uuid).
		First(&folder).Error

	if err != nil {
		return nil, err
	}

	return &folder, nil
}

func GetFolderByNameFromAccountID(name string, accountID uint) (*model.Folder, error) {
	var folder model.Folder
	err := config.DBClient.
		Where("name = ? AND account_id = ?", name, accountID).
		First(&folder).Error

	if err != nil {
		return nil, err
	}

	return &folder, nil
}

func UpdateFieldFolder(folderUUID string) {
	config.DBClient.Exec(`
		UPDATE folders f
		SET total_file = (
			SELECT COUNT(*)
			FROM files
			WHERE folder_id = f.id
		),
		total_size = (
			SELECT COALESCE(SUM(size), 0)
			FROM files
			WHERE folder_id = f.id
		)
		WHERE f.uuid = ?`, folderUUID)
}
