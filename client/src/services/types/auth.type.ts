export type LoginForm = {
    email: string;
    password: string;
}

export type RegisterForm = {
    email: string;
    password: string;
    confirmPassword: string;
}

export type LoginResponse = {
    email: string;
    role: string;
    plan_name: string;
}

export type RegisterResponse = {
    email: string;
    role: string;
    plan_name: string;
}

export type ConfigResponse = {
    is_authenticated: boolean;
}

export type LogoutResponse = null;