import { Axios } from "../../libs/api";
import type { CreateFolderForm } from "../types/folder.type";

const api = Axios();

export const FolderModule = {
    async GetFolders() {

    },

    async CreateFolder(data: CreateFolderForm) {
        const response = await api.post("/api/folders/", data);
        return response.data;
    }
}