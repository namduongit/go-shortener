package service

import (
	"url-shortener/internal/model"
	"url-shortener/internal/repository"
)

func SaveFileMetadata(file *model.File) error {
	return repository.CreateFile(file)
}

func GetFilesByUserID(userID uint) ([]model.FileResponse, error) {
	files, err := repository.GetFilesByUserID(userID)
	if err != nil {
		return nil, err
	}

	responses := make([]model.FileResponse, len(files))
	for i, file := range files {
		responses[i] = model.FileResponse{
			FileName:   file.FileName,
			StoredName: file.StoredName,
			Size:       file.Size,
			UploadedAt: file.CreatedAt,
		}
	}

	return responses, nil
}

func GetUserStorageUsage(userID uint) (int64, error) {
	return repository.GetTotalSizeByUserID(userID)
}

func GetFileForUser(userID uint, storedName string) (*model.File, error) {
	return repository.GetFileByStoredName(userID, storedName)
}

func DeleteFileForUser(userID uint, storedName string) error {
	return repository.DeleteFileByStoredName(userID, storedName)
}
