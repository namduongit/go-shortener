export type CreateTokenForm = {
    name: string;
    time?: number | null;
}

export type TokenResponse = {
    uuid: string;
    name: string;
    token: string;
    public_token: string;
    private_token?: string;
    expires_at: string | null;
    created_at: string;
}

export type TokenListResponse = {
    owner_uuid: string;
    tokens: TokenResponse[];
}

export type ActivityLogResponse = {
    uuid: string;
    action: "login" | "change_password" | "create_token";
    detail: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
}