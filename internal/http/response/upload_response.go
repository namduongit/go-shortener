package response

import "time"

type PresignUploadResponse struct {
	ClientFileID string    `json:"client_file_id"`
	SessionUUID  string    `json:"session_uuid"`
	Mode         string    `json:"mode"`
	Reason       string    `json:"reason"`
	Accepted     bool      `json:"accepted"`
	ExpiresAt    time.Time `json:"expires_at"`
	PartSize     uint64    `json:"part_size"`
}

type SignUploadResponse struct {
	UploadURL string `json:"upload_url"`
}
