package request

type CreateFolderRequest struct {
	Name string `json:"name" validate:"required"`
}
