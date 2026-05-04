package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Folder struct {
	gorm.Model

	UUID uuid.UUID `gorm:"type:uuid;uniqueIndex;not null;default:gen_random_uuid()"`

	Name      string `gorm:"size:100;not null"`
	TotalFile uint64
	TotalSize uint64

	// ParentFolderID *uint
	// ParentFolder   *Folder `gorm:"foreignKey:ParentFolderID;references:ID"`

	AccountID uint `gorm:"index"`
}
