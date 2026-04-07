package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FileType string

const (
	FileTypeImage    = "image"
	FileTypeDocument = "document"

	FileTypePrivate = "private"
)

type File struct {
	gorm.Model

	UUID uuid.UUID `gorm:"type:uuid;uniqueIndex;not null;default:gen_random_uuid()"`

	FileName    string
	FileType    FileType `gorm:"default:'private'"`
	ContentType string
	StorageKey  string
	Size        int64

	AccountID uint `gorm:"index"`

	FolderID *uint   `gorm:"index"`
	Folder   *Folder `gorm:"foreignKey:FolderID;references:ID"`

	UploadedAt time.Time `gorm:"autoCreateTime"`
}
