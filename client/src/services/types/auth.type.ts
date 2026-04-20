export type LoginForm = {
    email: string;
    password: string;
}

export type RegisterForm = {
    email: string;
    password: string;
    password_confirm: string;
}

export type ChangePasswordForm = {
    current_password: string;
    new_password: string;
    password_confirm: string;
}

type PlanDetailResponse = {
    uuid: string;
    name: string;
    storage_limit: number;
}

/** Type for the response */
export type LoginResponse = {
    uuid: string;
    email: string;
    plan: PlanDetailResponse;
}

export type RegisterResponse = {
    uuid: string;
    email: string;
    plan: PlanDetailResponse;
}

export type Config = {
    is_valid: boolean;
    issue_at: number;
    expires_in: number;
}

export type Usage = {
    plan_uuid: string;
    total_bytes: number;
    quota_bytes: number;
    used_storage: number;
    reserved_bytes: number;
}

export type AuthConfigResponse = {
    uuid: string;
    email: string;
    plan_name: string;
    usage: Usage;
    config: Config;
}

export type LogoutResponse = null;