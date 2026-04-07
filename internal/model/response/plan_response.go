package response

type PlanResponse struct {
	UUID         string `json:"uuid"`
	Name         string `json:"name"`
	Price        int64  `json:"price"`
	StorageLimit int64  `json:"storage_limit"`
	URLLimit     int64  `json:"url_limit"`
}

type MyPlanUsageResponse struct {
	Plan         PlanResponse `json:"plan"`
	TotalStorage int64        `json:"total_storage"`
	UsedStorage  int64        `json:"used_storage"`
	UsedURL      int64        `json:"used_url"`
}
