package response

import "time"

type URLResponse struct {
	UUID        string    `json:"uuid"`
	Code        string    `json:"code"`
	OriginalURL string    `json:"original_url"`
	ShortURL    string    `json:"short_url"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}

type URLListResponse struct {
	OwnerUUID string        `json:"owner_uuid"`
	URLs      []URLResponse `json:"urls"`
}
