package request

import "mime/multipart"

type UploadFileRequest struct {
	File       *multipart.File `form:"file" validate:"required"`
	FolderUUID string          `form:"folder"`
}

type UploadChunkRequest struct {
	File *multipart.File `form:"file" validate:"required"`
}
