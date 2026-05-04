package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type LogAction string

const (
	LogActionLogin          LogAction = "login"
	LogActionChangePassword LogAction = "change_password"
	LogActionCreateToken    LogAction = "create_token"
)

type ActivityLog struct {
	gorm.Model

	UUID uuid.UUID `gorm:"type:uuid;uniqueIndex;not null;default:gen_random_uuid()"`

	AccountID uint      `gorm:"not null;index"`
	Action    LogAction `gorm:"type:varchar(50);not null"`
	Detail    string    `gorm:"type:text"` // e.g. IP, user-agent, token name

	IPAddress string `gorm:"type:varchar(64)"`
	UserAgent string `gorm:"type:text"`
}
