import { FileModule } from "../../../services/modules/file.module";
import type { FileResponse } from "../../../services/types/file.type";
import { useNotificate } from "../../../common/hooks/useNotificate";
import { formatDate } from "../../../services/utils/date";
import { formatFileSize } from "../../../services/utils/file";
import { useEffect, useState } from "react";
import Button from "../button/button";

interface SideFileProps {
    file: FileResponse;
    onClose?: () => void;
    onFileDeleted?: () => void;
    resolveFileFolderName: (file: FileResponse) => string;
}

const SideFile = ({ file, onClose, onFileDeleted, resolveFileFolderName }: SideFileProps) => {
    const { DownloadFile, DeleteFile } = FileModule;
    const { showToast } = useNotificate();
    const [previewError, setPreviewError] = useState(false);

    const isImageFile = file.content_type?.startsWith("image/") || file.file_type?.toLowerCase() === "image";
    const imagePreviewUrl = `${import.meta.env.VITE_ENDPOINT_SHARE_IMAGE}/${file.uuid}`;

    useEffect(() => {
        setPreviewError(false);
    }, [file.uuid]);

    const handleCopyPublicImageUrl = async () => {
        try {
            await navigator.clipboard.writeText(imagePreviewUrl);
            showToast({
                type: "success",
                title: "Đã copy link",
                message: "Link public của ảnh đã được copy.",
            });
        } catch {
            showToast({
                type: "error",
                title: "Copy thất bại",
                message: "Không thể copy link public của ảnh.",
            });
        }
    };

    const handleOpenPublicImageUrl = () => {
        window.open(imagePreviewUrl, "_blank", "noopener,noreferrer");
    };

    const handleDownloadFile = async (file: FileResponse) => {
        try {
            const blob = await DownloadFile(file.uuid);
            const objectUrl = window.URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = objectUrl;
            anchor.download = file.file_name;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.URL.revokeObjectURL(objectUrl);
        } catch {
            showToast({
                type: "error",
                title: "Tải file thất bại",
                message: "Không thể tải file này vào lúc này.",
            });
        }
    };

    const handleDeleteFile = async (file: FileResponse) => {
        const confirmDelete = window.confirm(`Bạn có chắc muốn xóa file ${file.file_name}?`);
        if (!confirmDelete) {
            return;
        }

        try {
            await DeleteFile(file.uuid);
            showToast({
                type: "success",
                title: "Đã xóa file",
                message: `${file.file_name} đã được xóa.`,
            });
            onFileDeleted?.();
            onClose?.();
        } catch {
            showToast({
                type: "error",
                title: "Xóa file thất bại",
                message: "Không thể xóa file. Vui lòng thử lại.",
            });
        }
    };

    return (
        <aside className="rounded-2xl border border-gray-300/90 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Chi tiết file</p>

            <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-gray-300/90 bg-white p-4">
                    <p className="truncate text-sm font-semibold text-gray-900">{file.file_name}</p>
                    <p className="mt-1 text-xs text-gray-500">{file.content_type}</p>
                    {isImageFile && (
                        <div className="mt-3 space-y-3">
                            <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                                {!previewError ? (
                                    <img
                                        src={imagePreviewUrl}
                                        alt={file.file_name}
                                        className="h-52 w-full object-contain"
                                        onError={() => setPreviewError(true)}
                                    />
                                ) : (
                                    <div className="grid h-40 w-full place-items-center text-xs text-gray-500">
                                        Không thể xem trước ảnh này.
                                    </div>
                                )}
                            </div>

                            <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3">
                                <p className="text-xs font-semibold text-gray-700">Link public</p>
                                <input
                                    readOnly
                                    value={imagePreviewUrl}
                                    className="mt-2 w-full rounded-lg border border-gray-300/90 bg-white px-3 py-2 text-xs text-gray-700"
                                />
                                <div className="mt-2 flex items-center gap-2">
                                    <Button
                                        type="button"
                                        className="rounded-lg border border-gray-300/90 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                                        onClick={() => void handleCopyPublicImageUrl()}
                                    >
                                        Copy link
                                    </Button>
                                    <Button
                                        type="button"
                                        className="rounded-lg bg-[#1a73e8] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                                        onClick={handleOpenPublicImageUrl}
                                    >
                                        Mở link
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-2 text-sm text-gray-500">
                    <p>
                        <span className="font-semibold text-gray-900">Loại:</span> {file.file_type}
                    </p>
                    <p>
                        <span className="font-semibold text-gray-900">Dung lượng:</span> {formatFileSize(file.size)}
                    </p>
                    <p>
                        <span className="font-semibold text-gray-900">Ngày tải:</span> {formatDate(String(file.uploaded_at))}
                    </p>
                    <p>
                        <span className="font-semibold text-gray-900">Vị trí:</span> {resolveFileFolderName(file)}
                    </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                    <Button
                        type="button"
                        className="rounded-xl bg-[#1a73e8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                        onClick={() => void handleDownloadFile(file)}
                    >
                        Tải xuống
                    </Button>
                    <Button
                        type="button"
                        className="rounded-xl border border-[#ef4444] px-4 py-2 text-sm font-semibold text-[#dc2626] transition hover:bg-[#fef2f2]"
                        onClick={() => void handleDeleteFile(file)}
                    >
                        Xóa file
                    </Button>
                    <Button
                        type="button"
                        className="rounded-xl border border-gray-300/90 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-[#f8fafc]"
                        onClick={() => onClose?.()}
                    >
                        Đóng chi tiết
                    </Button>
                </div>
            </div>
        </aside>
    )
}

export default SideFile;