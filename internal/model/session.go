package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UploadType string

const (
	SingleUpload    UploadType = "single"
	MultipartUpload UploadType = "multipart"
)

type SessionStatus string

const (
	SessionInProgress SessionStatus = "initiated"
	SessionUploading  SessionStatus = "uploading"
	SessionCompleted  SessionStatus = "completed"
	SessionFailed     SessionStatus = "failed"
	SessionExpired    SessionStatus = "expired"
	SessionAborted    SessionStatus = "aborted"
)

type Session struct {
	gorm.Model

	UUID uuid.UUID `gorm:"type:uuid;uniqueIndex;not null;default:gen_random_uuid()"`

	AccountID uint `gorm:"not null;index:idx_sessions_account_status_exp,priority:1"`

	FileName    string `gorm:"not null"`
	ContentType string `gorm:"not null"`
	TotalSize   uint64 `gorm:"not null"`

	UploadType UploadType `gorm:"type:varchar(20);not null"`

	ObjectKeyTmp   string `gorm:"not null"`
	ObjectKeyFinal string `gorm:"not null"`

	// null nếu single upload
	S3UploadID *string `gorm:"type:text"`

	Status SessionStatus `gorm:"type:varchar(20);not null;default:'initiated';index:idx_sessions_account_status_exp,priority:2"`

	ExpiresAt time.Time `gorm:"not null;index;index:idx_sessions_account_status_exp,priority:3"`

	ReservedBytes uint64 `gorm:"default:0;not null"`

	Parts []Part `gorm:"foreignKey:SessionID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}
