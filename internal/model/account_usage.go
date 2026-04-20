package model

import "gorm.io/gorm"

type AccountUsage struct {
	gorm.Model

	AccountID     uint   `gorm:"uniqueIndex;not null"`
	QuotaBytes    uint64 `gorm:"default:0;not null"`
	UsedStorage   uint64 `gorm:"default:0;not null"`
	ReservedBytes uint64 `gorm:"default:0;not null"`
}
