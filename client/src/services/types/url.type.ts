export type UrlResponse = {
    id: number,
    code: string,
    original_url: string,
    short_url: string,
    description: string,
    created_at: string;
}

export type CreateUrlForm = {
    url: string;
    description: string;
}

export type UrlListResponse = {
    owner_id: number;
    urls: UrlResponse[];
}