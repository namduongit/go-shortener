import { Axios } from "../../libs/api";

const api = Axios();

export const FileModule = {
    async GetFiles() {
        const response = await api.get("/api/files/");
        return response.data;
    }
}