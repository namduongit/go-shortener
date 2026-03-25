package model

import "time"

type File struct {
	ID         uint `gorm:"primaryKey"`
	FileName   string
	StoredName string
	FilePath   string
	Size       int64
	CreatedAt  time.Time

	UserID uint
	User   User
}

type FileResponse struct {
	FileName   string    `json:"fileName"`
	StoredName string    `json:"storedName"`
	Size       int64     `json:"size"`
	UploadedAt time.Time `json:"uploadedAt"`
}
