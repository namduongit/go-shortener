package utils

import (
	"strconv"
)

func BuildTmpKey(accountID uint, fileName string, folderID *string) string {
	var destination string
	destination += strconv.Itoa(int(accountID)) + "/"
	if folderID != nil {
		destination += *folderID + "/"
	}
	destination += fileName
	return destination
}

func BuildFinalKey(accountID uint, fileName string, folderID *string) string {
	var destination string
	destination += cfg.MiniOFinalBucketName + "/"
	destination += strconv.Itoa(int(accountID)) + "/"
	if folderID != nil {
		destination += *folderID + "/"
	}
	destination += fileName
	return destination
}
