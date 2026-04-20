package request

type CreateShortUrLRequest struct {
	URL         string `json:"url" validate:"required"`
	Description string `json:"description" validate:"required"`
}
