package request

type ConflictStrategy string

const (
	ConflictStrategyOverwrite ConflictStrategy = "overwrite"
	ConflictStrategyKeep     ConflictStrategy = "keep"
)

type MetadataFile struct {
	ClientFileID     string           `json:"client_file_id" validate:"required"`
	Name             string           `json:"name" validate:"required"`
	Size             uint64           `json:"size" validate:"required"`
	ContentType      string           `json:"type" validate:"required"`
	ConflictStrategy ConflictStrategy `json:"conflict_strategy"`
}

type PresignUploadRequest struct {
	Files      []MetadataFile `json:"files" validate:"required"`
	FolderUUID *string        `json:"destination_uuid"`
}

type SignUploadRequest struct {
	IsMulti *bool   `json:"is_multi"`
	Parts   []int32 `json:"parts"`
}

type CompleteMultipartUploadRequest struct {
	PartCompletes []PartComplete `json:"part_completes"`
}

type PartComplete struct {
	PartNumber int32  `json:"part_number"`
	ETag       string `json:"etag"`
	SizeBytes  uint64 `json:"size_bytes"`
}
