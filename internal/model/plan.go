package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

/*
- Price is VND unit
- If you want to change price, please setup the price carefully
*/
type Plan struct {
	gorm.Model

	UUID uuid.UUID `gorm:"type:uuid;uniqueIndex;not null;default:gen_random_uuid()"`

	Name         string
	Price        int64
	StorageLimit int64
	URLLimit     int64

	Accounts []Account
}
