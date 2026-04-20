package response

type PlanDetailResponse struct {
	UUID         string `json:"uuid"`
	Name         string `json:"name"`
	StorageLimit uint64 `json:"storage_limit"`
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

type UsageResponse struct {
	PlanUUID      string `json:"plan_uuid"`
	TotalBytes    uint64 `json:"total_bytes"`
	QuotaBytes    uint64 `json:"quota_bytes"`
	UsedStorage   uint64 `json:"used_storage"`
	ReservedBytes uint64 `json:"reserved_bytes"`
}

type ConfigResponse struct {
	UUID     string               `json:"uuid"`
	Email    string               `json:"email"`
	PlanName string               `json:"plan_name"`
	Usage    UsageResponse        `json:"usage"`
	Config   ConfigDetailResponse `json:"config"`
}
