export type FileResponse = {
    id: number;
    file_name: string;
    store_name: string;
    size: number;
    uploaded_at: string;
}

export type FileListResponse = {
    accountID: number;
    files: FileResponse[];
}