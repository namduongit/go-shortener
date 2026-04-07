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

type Account struct {
	gorm.Model

	UUID uuid.UUID `gorm:"type:uuid;uniqueIndex;not null;default:gen_random_uuid()"`

	Email    string `gorm:"unique"`
	Role     Role   `gorm:"default:'none'"`
	Password string

	// One-to-One relationship with Profile
	Profile Profile

	Tokens  []Token
	Folders []Folder
	Files   []File
	URLs    []URL

	// Many-to-One relationship with Plan
	Plan   Plan
	PlanID uint `gorm:"index"`
}
