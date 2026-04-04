package model

import "gorm.io/gorm"

type FileType string

const (
	FileTypeImage    = "image"
	FileTypeDocument = "document"

	FileTypePrivate = "private"
)

type File struct {
	gorm.Model

	FileName    string
	FileType    FileType `gorm:"default:'private'"`
	ContentType string
	StorageKey  string
	Size        int64

	AccountID uint `gorm:"index"`

	FolderID *uint   `gorm:"index"`
	Folder   *Folder `gorm:"foreignKey:FolderID;references:ID"`
}
