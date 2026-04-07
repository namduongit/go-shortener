package service

import (
	"context"
	"errors"
	"fmt"
	"mime/multipart"
	"url-shortener/internal/config"
	"url-shortener/internal/model"
	"url-shortener/internal/repository"
	"url-shortener/internal/utils"

	"github.com/minio/minio-go/v7"
)

func pushToMiniO(context context.Context, accountID uint, fileHeader *multipart.FileHeader, folderID *uint) (string, error) {
	file, _ := fileHeader.Open()
	defer file.Close()

	storageKey := utils.GenStorageKey(accountID, folderID, fileHeader)

	_, err := config.CLMiniO.PutObject(
		context,
		"gms-cloud",
		storageKey,
		file,
		fileHeader.Size,
		minio.PutObjectOptions{
			ContentType: fileHeader.Header.Get("Content-Type"),
		},
	)

	if err != nil {
		fmt.Println(err)
		return "", errors.New("Can not upload file to cloud service")
	}

	return storageKey, nil
}

func CreateFile(context context.Context, accountID uint, fileHeader *multipart.FileHeader, folderUUID string) (*model.File, error) {
	var folderID *uint = nil
	var folder *model.Folder

	if folderUUID != "" {
		var err error
		folder, err = repository.GetFolderByUUID(folderUUID)
		if err != nil || folder == nil {
			return nil, errors.New("Folder not found")
		}

		folderID = &folder.ID
	}

	storageKey, err := pushToMiniO(context, accountID, fileHeader, folderID)
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

	err = repository.CreateFile(&file)
	if err != nil {
		return nil, err
	}

	if folder != nil {
		file.Folder = folder
	}

	if folderUUID != "" {
		repository.UpdateFieldFolder(folderUUID)
	}

	return &file, nil
}

func GetFilesFromAccountID(accountID uint) ([]model.File, error) {
	files, err := repository.GetFilesFromAccountID(accountID)
	if err != nil {
		return nil, err
	}

	return files, nil
}

func GetFileByUUID(uuid string) (*model.File, error) {
	file, err := repository.GetFileByUUID(uuid)
	if err != nil {
		return nil, err
	}
	return file, nil
}

func GetFileByUUIDAndAccountID(uuid string, accountID uint) (*model.File, error) {
	file, err := repository.GetFileByUUIDAndAccountID(uuid, accountID)
	if err != nil {
		return nil, err
	}

	return file, nil
}

func GetImageURL(ctx context.Context, file *model.File) (*minio.Object, error) {
	object, err := config.CLMiniO.GetObject(
		ctx,
		"gms-cloud",
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

func DeleteFileByUUID(ctx context.Context, accountID uint, uuid string) error {
	file, err := repository.GetFileByUUID(uuid)
	if err != nil {
		return errors.New("File not found")
	}

	if file.StorageKey != "" {
		err = config.CLMiniO.RemoveObject(ctx, "gms-cloud", file.StorageKey, minio.RemoveObjectOptions{})
		if err != nil {
			fmt.Println(err)
			return errors.New("Can not delete file from cloud service")
		}
	}

	err = repository.DeleteFileByUUIDFromAccountID(uuid, accountID)
	return err
}
