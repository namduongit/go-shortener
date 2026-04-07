package response

type PlanDetailResponse struct {
	UUID         string `json:"uuid"`
	Name         string `json:"name"`
	StorageLimit int64  `json:"storage_limit"`
}

type LoginResponse struct {
	UUID  string             `json:"uuid"`
	Email string             `json:"email"`
	Plan  PlanDetailResponse `json:"plan"`
}

type RegisterResponse struct {
	UUID  string             `json:"uuid"`
	Email string             `json:"email"`
	Plan  PlanDetailResponse `json:"plan"`
}

type ConfigDetailResponse struct {
	IsValid   bool  `json:"is_valid"`
	IssueAt   int64 `json:"issue_at"`
	ExpiresIn int64 `json:"expires_in"`
}
type ConfigResponse struct {
	UUID   string               `json:"uuid"`
	Email  string               `json:"email"`
	Config ConfigDetailResponse `json:"config"`
}
