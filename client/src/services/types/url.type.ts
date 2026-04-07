export type CreateUrlForm = {
    url: string;
    description: string;
}

export type UrlResponse = {
    uuid: string;

    code: string;
    original_url: string;
    short_url: string;
    description: string;

    created_at: Date;
}

export type UrlListResponse = {
    owner_uuid: string;
    urls: UrlResponse[];
}