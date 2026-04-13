package response

import "time"

type TokenResponse struct {
	UUID         string     `json:"uuid"`
	Name         string     `json:"name"`
	Token        string     `json:"token"`
	PublicToken  string     `json:"public_token"`
	PrivateToken *string    `json:"private_token,omitempty"`
	ExpiresAt    *time.Time `json:"expires_at"`
	CreatedAt    time.Time  `json:"created_at"`
}

type TokenListResponse struct {
	OwnerUUID string          `json:"owner_uuid"`
	Tokens    []TokenResponse `json:"tokens"`
}

type UploadImageResponse struct {
	UUID        string `json:"uuid"`
	FileName    string `json:"file_name"`
	FileType    string `json:"file_type"`
	ContentType string `json:"content_type"`
	PublicURL   string `json:"public_url"`
}
