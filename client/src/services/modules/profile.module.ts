import { Axios } from "../../libs/api";
import type { RestResponse } from "../../libs/response";
import type { ProfileResponse, UpdateProfileForm } from "../types/profile.type";

const api = Axios();

export const ProfileModule = {
    async GetProfile() {
        const response = await api.get<RestResponse<ProfileResponse>>("/api/guard/profile");
        return response.data;
    },

    async UpdateProfile(data: UpdateProfileForm) {
        const response = await api.put<RestResponse<ProfileResponse>>("/api/guard/profile", data);
        return response.data;
    }
}