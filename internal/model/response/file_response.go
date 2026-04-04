package response

import "time"

type FileResponse struct {
	ID          uint   `json:"id"`
	FileName    string `json:"file_name"`
	FileType    string `json:"file_type"`
	ContentType string `json:"content_type"`
	Size        int64  `json:"size"`

	FolderID   *uint  `json:"folder_id"`
	FolderName string `json:"folder_name"`

	UploadedAt time.Time `json:"uploaded_at"`
}

type FileListResponse struct {
	OwnerID uint           `json:"owner_id"`
	Files   []FileResponse `json:"files"`
}
