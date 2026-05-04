import type { FileResponse } from "../../../../../services/types/file.type";
import Button from "../../../button/button";


interface ShareFileModalProps {
    isOpen: boolean;
    file: FileResponse | null;
    onClose: () => void;
    onCopyLink: () => void;
    onShare: (file: FileResponse) => void | Promise<void>;
    onUnshare: (file: FileResponse) => void | Promise<void>;
    processing?: boolean;
}

const ShareFileModal = ({
    isOpen,
    file,
    onClose,
    onCopyLink,
    onShare,
    onUnshare,
    processing = false,
}: ShareFileModalProps) => {
    if (!isOpen || !file) {
        return null;
    }

    const shareUrl = `${import.meta.env.VITE_ENDPOINT_SHARE_FILE}/${file.uuid}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2937]/45 px-4 py-6">
            <div className="flex w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow">
                <div className="flex items-center justify-between border-b border-gray-300/90 px-6 py-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Chia sẻ file</h3>
                        <p className="mt-1 text-sm text-gray-500">Quản lý liên kết chia sẻ cho file đã chọn.</p>
                    </div>
                    <Button
                        type="button"
                        className="rounded-md border border-gray-300/90 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                        onClick={onClose}
                        disabled={processing}
                    >
                        Đóng
                    </Button>
                </div>

                <div className="space-y-4 px-6 py-5">
                    <div className="rounded-lg border border-gray-300/90 bg-gray-50/60 p-4 text-sm">
                        <p className="text-gray-500">UUID file</p>
                        <p className="mt-1 break-all font-medium text-gray-900">{file.uuid}</p>
                    </div>

                    <div className="rounded-lg border border-gray-300/90 bg-gray-50/60 p-4 text-sm">
                        <p className="text-gray-500">Tên file</p>
                        <p className="mt-1 break-all font-medium text-gray-900">{file.file_name}</p>
                    </div>

                    <div className="rounded-lg border border-gray-300/90 bg-gray-50/60 p-4 text-sm">
                        <p className="text-gray-500">Trạng thái</p>
                        <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${file.is_shared ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>
                            {file.is_shared ? "Đang chia sẻ" : "Chưa chia sẻ"}
                        </span>
                    </div>

                    <div className="rounded-lg border border-gray-300/90 bg-white p-4 text-sm">
                        <p className="text-gray-500">URL chia sẻ</p>
                        <div className="mt-2 flex items-center gap-2">
                            <input
                                value={shareUrl}
                                readOnly
                                className="w-full rounded-md border border-gray-300/90 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                            />
                            <Button
                                type="button"
                                className="shrink-0 rounded-md border border-gray-300/90 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                                onClick={onCopyLink}
                                disabled={!file.is_shared}
                            >
                                Copy
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-gray-300/90 px-6 py-4">
                    <Button
                        type="button"
                        className="rounded-md border border-gray-300/90 px-4 py-2 text-gray-900 hover:bg-gray-50"
                        onClick={onClose}
                        disabled={processing}
                    >
                        Hủy
                    </Button>
                    {file.is_shared ? (
                        <Button
                            type="button"
                            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={() => void onUnshare(file)}
                            disabled={processing}
                        >
                            {processing ? "Đang xử lý..." : "Hủy chia sẻ"}
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            className="rounded-md bg-[#1a73e8] px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={() => void onShare(file)}
                            disabled={processing}
                        >
                            {processing ? "Đang xử lý..." : "Chia sẻ"}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShareFileModal;
