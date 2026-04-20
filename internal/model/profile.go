package model

import (
	"gorm.io/gorm"
)

type Profile struct {
	gorm.Model

	AccountID uint `gorm:"uniqueIndex;not null"`

	AvatarURL   string
	FullName    string
	CompanyName string
	Address     string
	Phone       string
}
