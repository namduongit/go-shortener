package response

type PlanResponse struct {
	UUID         string `json:"uuid"`
	Name         string `json:"name"`
	Price        uint64 `json:"price"`
	StorageLimit uint64 `json:"storage_limit"`
	URLLimit     uint64 `json:"url_limit"`
}

type MyPlanUsageResponse struct {
	Plan         PlanResponse `json:"plan"`
	TotalStorage uint64       `json:"total_storage"`
	UsedStorage  uint64       `json:"used_storage"`
	UsedURL      uint64       `json:"used_url"`
}
