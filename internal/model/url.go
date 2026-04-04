package model

import (
	"gorm.io/gorm"
)

type URL struct {
	gorm.Model

	Description string
	ShortCode   string `gorm:"uniqueIndex"`
	LongURL     string

	AccountID uint `gorm:"index"`
}
