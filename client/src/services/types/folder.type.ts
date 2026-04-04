export type CreateFolderForm = {
    name: string;
}

export type FolderResponse = {
    id: number;
    name: string;
    total_files: number;

    created_at: string;
}

export type FolderListResponse = {
    owner_id: number;
    folders: FolderResponse[];
}