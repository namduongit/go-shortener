package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Scope string

const (
	ScopeRead  Scope = "read"
	ScopeWrite Scope = "write"
	ScopeAdmin Scope = "admin"
)

type Token struct {
	gorm.Model

	UUID uuid.UUID `gorm:"type:uuid;uniqueIndex;not null;default:gen_random_uuid()"`

	Name      string
	TokenHash string `gorm:"unique;not null"`
	Scope     string
	ExpiresAt *time.Time

	AccountID uint `gorm:"index"`
}
