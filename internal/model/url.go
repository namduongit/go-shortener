package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type URL struct {
	gorm.Model

	UUID uuid.UUID

	Description string
	ShortCode   string `gorm:"uniqueIndex"`
	LongURL     string

	AccountID uint `gorm:"index"`
}
