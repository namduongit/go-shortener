package response

import "time"

type ActivityLogResponse struct {
	UUID      string    `json:"uuid"`
	Action    string    `json:"action"`
	Detail    string    `json:"detail"`
	IPAddress string    `json:"ip_address"`
	UserAgent string    `json:"user_agent"`
	CreatedAt time.Time `json:"created_at"`
}
