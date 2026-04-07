export type LoginForm = {
    email: string;
    password: string;
}

export type RegisterForm = {
    email: string;
    password: string;
    confirmPassword: string;
}

type PlanDetailResponse = {
    uuid: string;
    name: string;
    storage_limit: number;
}

type ConfigDetailResponse = {
    is_valid: boolean;
    issue_at: number;
    expires_in: number;
}

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

export type ConfigResponse = {
    uuid: string;
    email: string;
    config: ConfigDetailResponse;
}

export type LogoutResponse = null;