import { Axios } from "../../libs/api";
import type { RestResponse } from "../../libs/response";
import type { PresignUploadForm, PresignUploadResponse, SignUploadResponse } from "../types/file.type";

const api = Axios();

export const UploadModule = {
    /**
        * Flow upload the file:
        * @First PresignUpload to get the session id 
        * @Second SignUpload to get the upload url
        * Then upload the file to the url with the session id as a header
        */
    async PresignUpload(data: PresignUploadForm) {
        const response = await api.post<RestResponse<PresignUploadResponse[]>>("/api/guard/presign-upload", data);
        return response.data;
    },

    async SignUpload(sessionId: string, partNumber?: number) {
        const response = await api.post<RestResponse<SignUploadResponse>>(`/api/guard/sign-upload/${sessionId}`, { part_number: partNumber });
        return response.data;
    },

    async UploadPart(sessionId: string, partNumber: number, etag: string, sizeBytes: number) {
        // 
        const response = await api.post(`/api/guard/upload-part/${sessionId}`, {
            part_number: partNumber,
            etag: etag,
            size_bytes: sizeBytes,
        })

        return response.data;
    },

    async CompeltePart(sessionId: string) {
        const response = await api.post(`/api/guard/complete-upload/${sessionId}`);
        return response.data;
    }

}