import { Axios } from "../../libs/api"
import type { RestResponse } from "../../libs/response";
import type { ChangePasswordForm, AuthConfigResponse, LoginForm, LoginResponse, LogoutResponse, RegisterForm, RegisterResponse } from "../types/auth.type"

const api = Axios();

export const AuthModule = {
    async Login(data: LoginForm) {
        const response = await api.post<RestResponse<LoginResponse>>("/auth/login", data);
        return response.data;
    },

    async Register(data: RegisterForm) {
        const response = await api.post<RestResponse<RegisterResponse>>("/auth/register", data);
        return response.data;
    },

    async Logout() {
        const response = await api.post<RestResponse<LogoutResponse>>("/auth/logout");
        return response.data;
    },

    async Config() {
        const response = await api.get<RestResponse<AuthConfigResponse>>("/api/guard/auth-config");
        return response.data;
    },

    async ChangePassword(data: ChangePasswordForm) {
        const response = await api.post<RestResponse<null>>("/api/guard/password", data);
        return response.data;
    }
}