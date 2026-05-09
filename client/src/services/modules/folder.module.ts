import { Axios } from "../../libs/api";
import type { RestResponse } from "../../libs/response";
import type { CreateFolderForm, FolderDetailResponse, FolderListResponse } from "../types/folder.type";
import type { FolderResponse } from "../types/folder.type";

const api = Axios();

export const FolderModule = {
    /**
     * Get list of folders
     * @returns 
     */
    async GetFolders() {
        const response = await api.get<RestResponse<FolderListResponse>>("/api/guard/folders");
        return response.data;
    },

    // Get folder detail by uuid
    async GetFolderByUuid(uuid: string) {
        const response = await api.get<RestResponse<FolderDetailResponse>>(`/api/guard/folders/${uuid}`);
        return response.data;
    },

    // Create new folder
    async CreateFolder(data: CreateFolderForm) {
        const response = await api.post<RestResponse<FolderResponse>>("/api/guard/folders", data);
        return response.data;
    },

    // Rename folder
    async RenameFolder(uuid: string, name: string) {
        const response = await api.patch<RestResponse<FolderResponse>>(`/api/guard/folders/${uuid}`, { name: name });
        return response.data;
    },

    // Delete folder
    async DeleteFolder(uuid: string) {
        const response = await api.delete<RestResponse<null>>(`/api/guard/folders/${uuid}`);
        return response.data;
    }
}
