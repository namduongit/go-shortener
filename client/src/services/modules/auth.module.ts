import { Axios } from "../../libs/api"
import type { RestResponse } from "../../libs/response";
import type { ConfigResponse, LoginForm, LoginResponse, LogoutResponse, RegisterForm, RegisterResponse } from "../types/auth.type"

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

    async Config(){
        const response = await api.get<RestResponse<ConfigResponse>>("/auth/config");
        return response.data;
    },

    async Logout(){
        const response = await api.post<RestResponse<LogoutResponse>>("/auth/logout");
        return response.data;
    }
}