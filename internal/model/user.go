package model

type Role string

const (
	RoleUser  Role = "user"
	RoleAdmin Role = "admin"
)

type User struct {
	ID       uint   `gorm:"primaryKey"`
	Email    string `gorm:"unique"`
	Password string

	Role Role `gorm:"default:'user'"`

	PlanID uint
	Plan   Plan

	URLs  []URL
	Files []File
}
