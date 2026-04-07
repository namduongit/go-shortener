import { FileModule } from "../../../services/modules/file.module";
import type { FileResponse } from "../../../services/types/file.type";
import { useNotificate } from "../../../common/hooks/useNotificate";
import { usePlanUsage } from "../../../common/hooks/usePlanUsage";
import { formatDate } from "../../../services/utils/date";
import { formatFileSize } from "../../../services/utils/file";

interface SideFileProps {
    file: FileResponse;
    onClose?: () => void;
    onFileDeleted?: () => void;
    resolveFileFolderName: (file: FileResponse) => string;
}

const SideFile = ({ file, onClose, onFileDeleted, resolveFileFolderName }: SideFileProps) => {
    const { DownloadFile, DeleteFile } = FileModule;
    const { showToast } = useNotificate();
    const { refreshPlanUsage } = usePlanUsage();

    const isImageFile = file.content_type?.startsWith("image/") || file.file_type?.toLowerCase() === "image";
    const imagePreviewUrl = `${import.meta.env.VITE_SERVER_URL}/api/public/images/${file.uuid}`;

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
            void refreshPlanUsage();
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
                        <a
                            href={imagePreviewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex text-xs font-semibold text-blue-500 hover:underline"
                        >
                            Xem ảnh preview
                        </a>
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
                    <button
                        className="rounded-xl bg-[#1a73e8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                        onClick={() => void handleDownloadFile(file)}
                    >
                        Tải xuống
                    </button>
                    <button
                        className="rounded-xl border border-[#ef4444] px-4 py-2 text-sm font-semibold text-[#dc2626] transition hover:bg-[#fef2f2]"
                        onClick={() => void handleDeleteFile(file)}
                    >
                        Xóa file
                    </button>
                    <button
                        className="rounded-xl border border-gray-300/90 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-[#f8fafc]"
                        onClick={() => onClose?.()}
                    >
                        Đóng chi tiết
                    </button>
                </div>
            </div>
        </aside>
    )
}

export default SideFile;