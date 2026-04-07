package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Profile struct {
	gorm.Model

	UUID uuid.UUID `gorm:"type:uuid;uniqueIndex;not null;default:gen_random_uuid()"`

	Username    string `gorm:"uniqueIndex"`
	AvatarURL   string
	FullName    string
	CompanyName string
	Address     string
	Phone       string

	AccountID uint `gorm:"index"`
}
