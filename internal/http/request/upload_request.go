package request

type MetadataFile struct {
	ClientFileID string `json:"client_file_id" validate:"required"`
	Name         string `json:"name" validate:"required"`
	Size         uint64 `json:"size" validate:"required"`
	ContentType  string `json:"type" validate:"required"`
}

type PresignUploadRequest struct {
	Files []MetadataFile `json:"files" validate:"required"`
}

type SignUploadRequest struct {
	PartNumber *int32 `json:"part_number"`
}

type UploadPartRequest struct {
	PartNumber int32  `json:"part_number" validate:"required"`
	ETag       string `json:"etag" validate:"required"`
	SizeBytes  uint64 `json:"size_bytes" validate:"required"`
}
