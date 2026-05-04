import { Axios } from "../../libs/api";
import type { RestResponse } from "../../libs/response";
import type { ActivityLogResponse, CreateTokenForm, TokenListResponse, TokenResponse } from "../types/token.type";

const api = Axios();

export const TokenModule = {
    async GetTokens() {
        const response = await api.get<RestResponse<TokenListResponse>>("/api/guard/tokens");
        return response.data;
    },

    async CreateToken(data: CreateTokenForm) {
        const response = await api.post<RestResponse<TokenResponse>>("/api/guard/tokens", data);
        return response.data;
    },

    async DeleteToken(uuid: string) {
        const response = await api.delete<RestResponse<null>>(`/api/guard/tokens/${uuid}`);
        return response.data;
    },

    async RenewToken(uuid: string, days: number = 30) {
        const response = await api.patch<RestResponse<TokenResponse>>(`/api/guard/tokens/${uuid}/renew`, { days });
        return response.data;
    },

    async GetActivityLogs(limit: number = 50) {
        const response = await api.get<RestResponse<ActivityLogResponse[]>>(`/api/guard/logs?limit=${limit}`);
        return response.data;
    },
}