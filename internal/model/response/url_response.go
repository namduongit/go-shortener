package response

import "time"

type URLResponse struct {
	ID          uint      `json:"id"`
	Code        string    `json:"code"`
	OriginalURL string    `json:"original_url"`
	ShortURL    string    `json:"short_url"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}

type URLListResponse struct {
	OwnerID uint          `json:"owner_id"`
	URLs    []URLResponse `json:"urls"`
}
