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
        if (data.folderID && data.folderID !== 0) {
            formData.append("folderID", data.folderID.toString());
        }

        const response = await api.post<RestResponse<FileResponse>>("/api/guard/files", formData);
        return response.data;
    },

    async DeleteFile(fileId: number) {
        const response = await api.delete<RestResponse<null>>(`/api/guard/files/${fileId}`);
        return response.data;
    },

    async DownloadFile(fileId: number) {
        try {
            const response = await api.get(`/api/guard/files/${fileId}/download`, {
                responseType: "blob",
            });
            return response.data as Blob;
        } catch {
            const fallbackResponse = await api.get(`/api/guard/files/${fileId}`, {
                responseType: "blob",
            });
            return fallbackResponse.data as Blob;
        }
    }
}