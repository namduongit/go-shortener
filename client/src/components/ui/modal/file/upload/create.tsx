import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import Button from "../../../button/button";
import { formatFileSize, getIconForFileType } from "../../../../../services/utils/file";

type UploadFile = {
    file: File;
    progress: number; // 0-100
    status: "pending" | "uploading" | "done" | "error";
};

type UploadFileModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (files: File[]) => void;
    destinationLabel: string;
    uploadProgress?: Record<string, number>; // filename → 0-100
};

const UploadFileModal = ({
    isOpen,
    onClose,
    onSubmit,
    destinationLabel = "GMS Cloud",
    uploadProgress = {},
}: UploadFileModalProps) => {
    const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const addFiles = (incoming: FileList | File[]) => {
        const next = Array.from(incoming);
        setUploadFiles((prev) => {
            const existingNames = new Set(prev.map((f) => f.file.name));
            const toAdd = next
                .filter((f) => !existingNames.has(f.name))
                .map((f) => ({ file: f, progress: 0, status: "pending" as const }));
            return [...prev, ...toAdd];
        });
    };

    const removeFile = (fileName: string) =>
        setUploadFiles((prev) => prev.filter((f) => f.file.name !== fileName));

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        addFiles(e.dataTransfer.files);
    };

    const handleSubmit = () => {
        if (uploadFiles.length === 0 || isSubmitting) return;
        setIsSubmitting(true);
        onSubmit(uploadFiles.map((u) => u.file));
    };

    useEffect(() => {
        if (!isOpen) {
            setUploadFiles([]);
            setIsDragging(false);
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const totalSize = useMemo(
        () => uploadFiles.reduce((s, u) => s + u.file.size, 0),
        [uploadFiles]
    );

    const overallProgress = useMemo(() => {
        const keys = Object.keys(uploadProgress);
        if (keys.length === 0) return 0;
        return Math.round(keys.reduce((s, k) => s + (uploadProgress[k] ?? 0), 0) / keys.length);
    }, [uploadProgress]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center px-4 pb-4 sm:pb-0">
            <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">Tải tệp lên</h3>
                        <p className="mt-0.5 text-xs text-gray-400">
                            Đến: <span className="font-medium text-gray-600">{destinationLabel}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="grid h-8 w-8 place-items-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-40"
                    >
                        <i className="fa-solid fa-xmark text-sm" />
                    </button>
                </div>

                {!isSubmitting && (
                    <div
                        className={`mx-5 mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-8 text-center transition-colors ${isDragging
                            ? "border-blue-400 bg-blue-50"
                            : "border-gray-200 bg-gray-50 hover:border-gray-300"
                            }`}
                        onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                    >
                        <div className="grid h-12 w-12 place-items-center rounded-full bg-blue-100 text-blue-500">
                            <i className="fa-solid fa-cloud-arrow-up text-xl" />
                        </div>
                        <p className="mt-3 text-sm font-medium text-gray-700">Kéo thả tệp vào đây</p>
                        <p className="mt-1 text-xs text-gray-400">hoặc</p>
                        <button
                            className="mt-2 rounded-md border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Chọn từ máy
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                                addFiles(e.target.files ?? []);
                                e.target.value = "";
                            }}
                        />
                    </div>
                )}

                {uploadFiles.length > 0 && (
                    <div className="mx-5 mt-3 max-h-52 overflow-y-auto space-y-1.5 pr-1">
                        {uploadFiles.map((u) => {
                            const pct = isSubmitting ? (uploadProgress[u.file.name] ?? 0) : 0;
                            const done = pct >= 100;
                            return (
                                <div
                                    key={u.file.name}
                                    className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-3 py-2"
                                >
                                    <img
                                        src={getIconForFileType(u.file.type)}
                                        alt=""
                                        className="h-7 w-7 shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-gray-800">
                                            {u.file.name}
                                        </p>
                                        <div className="mt-1 flex items-center gap-2">
                                            {isSubmitting ? (
                                                <>
                                                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-gray-100">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-300 ${done ? "bg-emerald-500" : "bg-blue-500"}`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className="shrink-0 text-xs text-gray-400">{pct}%</span>
                                                </>
                                            ) : (
                                                <span className="text-xs text-gray-400">
                                                    {u.file.type || "Không xác định"} · {formatFileSize(u.file.size)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {!isSubmitting && (
                                        <button
                                            className="grid h-6 w-6 shrink-0 place-items-center rounded text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                                            onClick={() => removeFile(u.file.name)}
                                        >
                                            <i className="fa-solid fa-xmark text-xs" />
                                        </button>
                                    )}
                                    {isSubmitting && done && (
                                        <i className="fa-solid fa-circle-check shrink-0 text-emerald-500 text-sm" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {isSubmitting && (
                    <div className="mx-5 mt-3 space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Tiến trình tổng</span>
                            <span>{overallProgress}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                            <div
                                className="h-full rounded-full bg-blue-500 transition-all duration-300"
                                style={{ width: `${overallProgress}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between px-5 py-4 mt-3">
                    {uploadFiles.length > 0 ? (
                        <p className="text-xs text-gray-400">
                            {uploadFiles.length} tệp · {formatFileSize(totalSize)}
                        </p>
                    ) : (
                        <span />
                    )}
                    <div className="flex gap-2">
                        <Button
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={uploadFiles.length === 0 || isSubmitting}
                            className="rounded-lg bg-[#1a73e8] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <i className="fa-solid fa-spinner fa-spin text-xs" />
                                    Đang tải…
                                </span>
                            ) : (
                                "Tải lên"
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadFileModal;