package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Token struct {
	gorm.Model

	UUID uuid.UUID `gorm:"type:uuid;uniqueIndex;not null;default:gen_random_uuid()"`

	Name      string
	Token     string `gorm:"unique;not null"`
	TokenHash string `gorm:"unique;not null"`
	ExpiresAt *time.Time

	AccountID uint `gorm:"index"`
}
