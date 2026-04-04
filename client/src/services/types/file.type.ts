export type UploadFileForm = {
    file: File;
    folderID: number;
}

export type FileResponse = {
    id: number;
    file_name: string;
    file_type: string;
    content_type: string;
    size: number;
    folder_id: number | null;
    folder_name: string;

    uploaded_at: string;
}

export type FileListResponse = {
    owner_id: number;
    files: FileResponse[];
}