export type PresignUploadForm = {
    files: {
        client_file_id: string;
        name: string;
        size: number;
        type: string;
    }[];
    destination_uuid?: string;
}

export type PresignUploadResponse = {
    client_file_id: string;
    session_uuid: string;
    mode: string; //  single or multipart
    reason: string;
    accepted: boolean;
    expires_at: Date;
    part_size: number;
}

export type SignUploadResponse = { 
    upload_url: string; 
}

export type FileResponse = {
    uuid: string;
    
    file_name: string;
    file_type: string;
    content_type: string;
    size: number;
    is_shared: boolean;

    folder_uuid: string | null;
    folder_name: string;

    uploaded_at: Date;
}

export type FileListResponse = {
    owner_uuid: string;
    files: FileResponse[];
}