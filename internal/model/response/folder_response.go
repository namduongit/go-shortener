package response

import "time"

type FolderResponse struct {
	UUID       string    `json:"uuid"`
	Name       string    `json:"name"`
	TotalFiles int64     `json:"total_files"`
	TotalSize  int64     `json:"total_size"`
	CreatedAt  time.Time `json:"created_at"`
}

type FolderListResponse struct {
	OwnerUUID string           `json:"owner_uuid"`
	Folders   []FolderResponse `json:"folders"`
}
