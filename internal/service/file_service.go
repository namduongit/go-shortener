package service

import (
	"context"
	"errors"
	"mime/multipart"
	"strconv"
	"strings"
	"url-shortener/internal/config"
	"url-shortener/internal/model"
	"url-shortener/internal/repository"
	"url-shortener/internal/utils"

	"github.com/minio/minio-go/v7"
)

func SaveFile(context context.Context, accountID uint, fileHeader *multipart.FileHeader, folderID *uint) (string, error) {
	file, _ := fileHeader.Open()
	defer file.Close()

	storageKey := utils.GenStorageKey(accountID, folderID, fileHeader)

	_, err := config.CLMiniO.PutObject(
		context,
		"go-shortener",
		storageKey,
		file,
		fileHeader.Size,
		minio.PutObjectOptions{
			ContentType: fileHeader.Header.Get("Content-Type"),
		},
	)

	if err != nil {
		return "", errors.New("Can not upload file to cloud service")
	}

	return storageKey, nil
}

func PushFileToCloud(context context.Context, accountID uint, fileHeader *multipart.FileHeader, folderIDString string) (*model.File, error) {
	var folderID *uint = nil

	if folderIDString != "" {
		parsedID, err := strconv.ParseUint(folderIDString, 10, 32)
		if err != nil {
			return nil, errors.New("Invalid folderID format")
		}

		folderIDUint := uint(parsedID)
		folder, err := repository.GetFolderByID(folderIDUint)
		if err != nil || folder == nil {
			return nil, errors.New("Folder not found")
		}

		folderID = &folderIDUint
	}

	storageKey, err := SaveFile(context, accountID, fileHeader, folderID)
	if err != nil {
		return nil, err
	}

	file := model.File{
		FileName:    fileHeader.Filename,
		FileType:    model.FileType(utils.GetFileType(fileHeader.Header.Get("Content-Type"))),
		ContentType: fileHeader.Header.Get("Content-Type"),
		StorageKey:  storageKey,
		Size:        fileHeader.Size,
		AccountID:   accountID,
		FolderID:    folderID,
	}

	return repository.CreateFile(&file)
}

func GetFilesByAccountID(accountID uint) ([]model.File, error) {
	files, err := repository.GetFilesByAccountID(accountID)
	if err != nil {
		return nil, err
	}

	return files, nil
}

func GetFileByID(fileID uint) (*model.File, error) {
	file, err := repository.GetFileByID(fileID)
	if err != nil {
		return nil, err
	}
	return file, nil
}

func GetImageURL(ctx context.Context, file *model.File) (*minio.Object, error) {
	object, err := config.CLMiniO.GetObject(
		ctx,
		"go-shortener",
		file.StorageKey,
		minio.GetObjectOptions{},
	)

	if err != nil {
		return nil, errors.New("Can not get file from cloud service")
	}

	_, err = object.Stat()
	if err != nil {
		return nil, errors.New("File not found in cloud service")
	}

	return object, nil
}

func DeleteFileByID(ctx context.Context, accountID uint, fileID uint) error {
	file, err := repository.GetFileByIDAndAccountID(fileID, accountID)
	if err != nil {
		if strings.Contains(err.Error(), "record not found") {
			return errors.New("File not exists")
		}

		return err
	}

	if file.StorageKey != "" {
		err = config.CLMiniO.RemoveObject(ctx, "go-shortener", file.StorageKey, minio.RemoveObjectOptions{})
		if err != nil {
			return errors.New("Can not delete file from cloud service")
		}
	}

	err = repository.DeleteFileByID(fileID, accountID)
	if err != nil {
		if strings.Contains(err.Error(), "record not found") {
			return errors.New("File not exists")
		}

		return err
	}

	return nil
}

func MoveFileToFolder(accountID uint, fileID uint, folderID *uint) error {
	_, err := repository.GetFileByIDAndAccountID(fileID, accountID)
	if err != nil {
		if strings.Contains(err.Error(), "record not found") {
			return errors.New("File not exists")
		}

		return err
	}

	if folderID != nil {
		_, err = repository.GetFolderByIDAndAccountID(*folderID, accountID)
		if err != nil {
			if strings.Contains(err.Error(), "record not found") {
				return errors.New("Folder not found")
			}

			return err
		}
	}

	err = repository.UpdateFileFolder(fileID, accountID, folderID)
	if err != nil {
		if strings.Contains(err.Error(), "record not found") {
			return errors.New("File not exists")
		}

		return err
	}

	return nil
}
