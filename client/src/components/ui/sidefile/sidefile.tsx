import { FileModule } from "../../../services/modules/file.module";
import type { FileResponse } from "../../../services/types/file.type";
import { useNotificate } from "../../../common/hooks/useNotificate";
import { formatDate } from "../../../services/utils/date";
import { formatFileSize, getIconForFileType } from "../../../services/utils/file";
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

    const isImageFile = file.content_type?.startsWith("image/");
    const imagePreviewUrl = `${import.meta.env.VITE_ENDPOINT_SHARE_IMAGE}/${file.uuid}`;

    useEffect(() => {
        setPreviewError(false);
    }, [file.uuid]);

    const handleCopyPublicImageUrl = async () => {
        try {
            await navigator.clipboard.writeText(imagePreviewUrl);
            showToast({ type: "success", title: "Đã copy", message: "Link public đã được sao chép." });
        } catch {
            showToast({ type: "error", title: "Thất bại", message: "Không thể sao chép link." });
        }
    };

    const handleOpenPublicImageUrl = () =>
        window.open(imagePreviewUrl, "_blank", "noopener,noreferrer");

    const handleDownloadFile = async () => {
        try {
            const blob = await DownloadFile(file.uuid);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = file.file_name;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            showToast({ type: "error", title: "Lỗi", message: "Không thể tải file này." });
        }
    };

    const handleDeleteFile = async () => {
        if (!window.confirm(`Xóa "${file.file_name}"?`)) return;
        try {
            await DeleteFile(file.uuid);
            showToast({ type: "success", title: "Đã xóa", message: `${file.file_name} đã được xóa.` });
            onFileDeleted?.();
            onClose?.();
        } catch {
            showToast({ type: "error", title: "Lỗi", message: "Không thể xóa file." });
        }
    };

    return (
        <aside className="flex flex-col h-full overflow-y-auto bg-white border-l border-gray-100">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Chi tiết
                </span>
                <button
                    onClick={onClose}
                    className="grid h-7 w-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                    <i className="fa-solid fa-xmark text-xs" />
                </button>
            </div>

            <div className="flex flex-col gap-5 p-4">
                <div className="flex items-start gap-3">
                    <img
                        src={getIconForFileType(file.content_type)}
                        alt=""
                        className="h-9 w-9 shrink-0 mt-0.5"
                    />
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900 leading-snug">
                            {file.file_name}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400 truncate">{file.content_type}</p>
                    </div>
                </div>

                {isImageFile && (
                    <div className="overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                        {!previewError ? (
                            <img
                                src={imagePreviewUrl}
                                alt={file.file_name}
                                className="h-44 w-full object-contain"
                                onError={() => setPreviewError(true)}
                            />
                        ) : (
                            <div className="grid h-32 place-items-center text-xs text-gray-400">
                                <span><i className="fa-regular fa-image mr-1.5" />Không thể xem trước</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="space-y-0 rounded-lg border border-gray-100 overflow-hidden text-sm">
                    {[
                        { label: "Dung lượng", value: formatFileSize(file.size) },
                        { label: "Ngày tải", value: formatDate(String(file.uploaded_at)) },
                        { label: "Vị trí", value: resolveFileFolderName(file) },
                    ].map((row) => (
                        <div key={row.label} className="flex items-center justify-between gap-3 px-3 py-2.5 border-b border-gray-100 last:border-b-0">
                            <span className="text-xs text-gray-400 shrink-0">{row.label}</span>
                            <span className="text-xs font-medium text-gray-700 truncate text-right">{row.value}</span>
                        </div>
                    ))}
                </div>

                {isImageFile && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-500">Link public</p>
                        <div className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                            <input
                                readOnly
                                value={imagePreviewUrl}
                                className="min-w-0 flex-1 bg-transparent text-xs text-gray-600 outline-none"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={() => void handleCopyPublicImageUrl()}
                            >
                                <i className="fa-regular fa-copy mr-1.5" />
                                Sao chép
                            </button>
                            <button
                                className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={handleOpenPublicImageUrl}
                            >
                                <i className="fa-solid fa-arrow-up-right-from-square mr-1.5" />
                                Mở link
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-2 pt-1">
                    <Button
                        type="button"
                        className="flex items-center justify-center gap-2 rounded-lg bg-[#1a73e8] px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                        onClick={() => void handleDownloadFile()}
                    >
                        <i className="fa-solid fa-download text-xs" />
                        Tải xuống
                    </Button>
                    <Button
                        type="button"
                        className="flex items-center justify-center gap-2 rounded-lg border border-red-100 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                        onClick={() => void handleDeleteFile()}
                    >
                        <i className="fa-regular fa-trash-can text-xs" />
                        Xóa file
                    </Button>
                </div>
            </div>
        </aside>
    );
};

export default SideFile;