import { Axios } from "../../libs/api";
import type { RestResponse } from "../../libs/response";
import type { FileListResponse, FileResponse, UploadFileForm } from "../types/file.type";

const api = Axios();

export const FileModule = {
    async GetFiles() {
        const response = await api.get<RestResponse<FileListResponse>>("/api/guard/files");
        return response.data;
    },

    async UploadFile(data: UploadFileForm) {
        const formData = new FormData();
        formData.append("file", data.file);
        if (data.folder) {
            formData.append("folder", data.folder);
        }

        const response = await api.post<RestResponse<FileResponse>>("/api/guard/files", formData);
        return response.data;
    },

    async DeleteFile(fileUUID: string) {
        const response = await api.delete<RestResponse<null>>(`/api/guard/files/${fileUUID}`);
        return response.data;
    },

    async DownloadFile(fileUUID: string) {
        const response = await api.get(`/api/guard/file/${fileUUID}/download`, {
            responseType: "blob",
        });
        return response.data as Blob;
    }
}