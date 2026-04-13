package service

import (
	"mime/multipart"
	"url-shortener/internal/model"
	"url-shortener/internal/repository"
)

func VerifyServiceStore(account *model.Account, file *multipart.FileHeader) bool {
	usedStorage, err := repository.GetTotalFileSizeByAccountID(account.ID)
	if err != nil {
		return false
	}

	fileSize := file.Size
	plan := account.Plan

	if usedStorage+fileSize > plan.StorageLimit {
		return false
	}

	return true
}

func VerifyServiceCountURL(account *model.Account) bool {
	usedURLs, err := repository.CountURLsByAccountID(account.ID)
	if err != nil {
		return false
	}

	plan := account.Plan

	if usedURLs >= plan.URLLimit {
		return false
	}

	return true
}
