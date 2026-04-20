package response

import "time"

type FileResponse struct {
	UUID        string    `json:"uuid"`
	FileName    string    `json:"file_name"`
	FileType    string    `json:"file_type"`
	ContentType string    `json:"content_type"`
	Size        uint64    `json:"size"`
	IsShared    bool      `json:"is_shared"`
	FolderUUID  *string   `json:"folder_uuid"`
	FolderName  string    `json:"folder_name"`
	UploadedAt  time.Time `json:"uploaded_at"`
}

type FileListResponse struct {
	OwnerUUID string         `json:"owner_uuid"`
	Files     []FileResponse `json:"files"`
}

type FileShareResponse struct {
	UUID        string `json:"uuid"`
	IsShared    bool   `json:"is_shared"`
	DownloadURL string `json:"download_url"`
}
