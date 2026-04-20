package model

import (
	"gorm.io/gorm"
)

type Part struct {
	gorm.Model

	SessionID  uint   `gorm:"index;not null;index"`
	PartNumber int32  `gorm:"not null;index"`
	ETag       string `gorm:"not null"`
	SizeBytes  uint64 `gorm:"not null"`
}
