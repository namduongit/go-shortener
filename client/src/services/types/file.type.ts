export type UploadFileForm = {
    file: File;
    folder?: string;
}

export type FileResponse = {
    uuid: string;
    
    file_name: string;
    file_type: string;
    content_type: string;
    size: number;

    folder_uuid: string | null;
    folder_name: string;

    uploaded_at: Date;
}

export type FileListResponse = {
    owner_uuid: string;
    files: FileResponse[];
}