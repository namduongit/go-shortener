export type UrlResponse = {
    id: number,
    short_code: string,
    long_url: string,
    created_at: string
}

export type UrlListResponse = {
    accountID: number;
    urls: UrlResponse[];
}