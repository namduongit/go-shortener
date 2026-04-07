package service

import (
	"url-shortener/internal/model"
	"url-shortener/internal/repository"
)

func GetFoldersByUserID(accountID uint) ([]model.Folder, error) {
	folders, err := repository.GetFoldersFromAccountID(accountID)
	if err != nil {
		return nil, err
	}

	return folders, nil
}

func GetFolderByUUID(uuid string) (*model.Folder, error) {
	return repository.GetFolderByUUID(uuid)
}

func GetFolderByNameFromAccountID(name string, accountID uint) (*model.Folder, error) {
	return repository.GetFolderByNameFromAccountID(name, accountID)
}
func CreateFolder(userID uint, name string) (*model.Folder, error) {
	folder := model.Folder{
		AccountID: userID,
		Name:      name,
		TotalFile: 0,
		TotalSize: 0,
	}

	if err := repository.CreateFolder(&folder); err != nil {
		return nil, err
	}

	return &folder, nil
}
