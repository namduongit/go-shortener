import { Axios } from "../../libs/api";
import type { RestResponse } from "../../libs/response";
import type { UrlListResponse } from "../types/url.type";

const api = Axios();

export const UrlModule = {
    async GetUrls() {
        const response = await api.get<RestResponse<UrlListResponse>>("/api/urls/");
        return response.data;
    }
}