package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Role string

const (
	RoleUser  Role = "none"
	RoleAdmin Role = "admin"
)

type AccountStatus string

const (
	StatusActive   AccountStatus = "active"
	StatusInactive AccountStatus = "inactive"
	StatusBanned   AccountStatus = "banned"
)

type Account struct {
	gorm.Model

	UUID uuid.UUID `gorm:"type:uuid;uniqueIndex;not null;default:gen_random_uuid()"`

	Email    string `gorm:"uniqueIndex;not null"`
	Role     Role   `gorm:"default:'none'"`
	Password string
	Version  uint `gorm:"default:0; not null"`

	Status AccountStatus `gorm:"default:'inactive'"`
	// Token for email verification, It is JWT token that contains expiration time and email of account
	// VerificationToken string `gorm:"type:text; default:null"` Now, using redis to store with expiration time instead of store in database
	OldActivationToken string `gorm:"type:text; default:null"`
	// One-to-One relationship with AccountUsage
	Usage AccountUsage `gorm:"foreignKey:AccountID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	// One-to-One relationship with Profile
	Profile Profile `gorm:"foreignKey:AccountID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	Tokens   []Token
	Folders  []Folder
	Files    []File
	URLs     []URL
	Activity []ActivityLog

	Sessions []Session

	// Many-to-One relationship with Plan
	Plan   Plan
	PlanID uint `gorm:"index"`
}
