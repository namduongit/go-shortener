import { Axios } from "../../libs/api";
import type { RestResponse } from "../../libs/response";
import type { FileListResponse, FileResponse } from "../types/file.type";

const api = Axios();

export const FileModule = {
    /**
     * Get a list of all files  
     * @returns FileListResponse
     */
    async GetFiles() {
        const response = await api.get<RestResponse<FileListResponse>>("/api/guard/files");
        return response.data;
    },
    /**
     * Delete a file by uuid
     * @param uuid 
     * @returns 
     */
    async DeleteFile(uuid: string) {
        const response = await api.delete<RestResponse<null>>(`/api/guard/files/${uuid}`);
        return response.data;
    },

    /**
     * Share a file by uuid
     * @param uuid 
     * @returns FileResponse -> the updated file after sharing
     * 
     * ! The file can be downloaded by anyone with the link after sharing
     */
    async ShareFile(uuid: string) {
        const response = await api.post<RestResponse<FileResponse>>(`/api/guard/files/${uuid}/share`);
        return response.data;
    },

    /**
     * Unshare a file by uuid
     * @param uuid 
     * @returns FileResponse -> the updated file after unsharing
     */
    async UnshareFile(uuid: string) {
        const response = await api.post<RestResponse<FileResponse>>(`/api/guard/files/${uuid}/unshare`);
        return response.data;
    },

    /**
     * Download a file by uuid, the response is a blob which can be used to create a download link
     * @param uuid 
     * @returns Blob
     * 
     * ! This is owner url to download the file
     */
    async DownloadFile(uuid: string) {
        // VITE_ENDPOINT_DOWNLOAD_FILE=http://localhost:8080/api/guard/file/{uuid}/download
        const response = await api.get(`/api/guard/file/${uuid}/download`, {
            responseType: "blob",
        });
        return response.data as Blob;
    }
}