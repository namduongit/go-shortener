import { Axios } from "../../libs/api";
import type { RestResponse } from "../../libs/response";
import type { CreateUrlForm, UrlListResponse, UrlResponse } from "../types/url.type";

const api = Axios();

export const UrlModule = {
    async GetUrls() {
        const response = await api.get<RestResponse<UrlListResponse>>("/api/guard/urls");
        return response.data;
    },

    async CreateUrl(data: CreateUrlForm) {
        const response = await api.post<RestResponse<UrlResponse>>("/api/guard/urls", data);
        return response.data;
    },

    async DeleteUrl(id: number) {
        const response = await api.delete<RestResponse<null>>(`/api/guard/urls/${id}`);
        return response.data;
    }
}