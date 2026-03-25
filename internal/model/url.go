package model

import "time"

type URL struct {
	ID        uint   `gorm:"primaryKey"`
	ShortCode string `gorm:"uniqueIndex"`
	LongURL   string
	CreatedAt time.Time

	UserID uint
	User   User
}

type URLResponse struct {
	ShortCode string    `json:"short_code"`
	LongURL   string    `json:"long_url"`
	CreatedAt time.Time `json:"created_at"`
}
