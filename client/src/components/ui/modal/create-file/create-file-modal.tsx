import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import Button from "../../button/button";
import { formatFileSize } from "../../../../services/utils/file";

type CreateFileModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (files: File[]) => void | Promise<void>;
    destinationLabel?: string;
}

const CreateFileModal = ({ isOpen, onClose, onSubmit, destinationLabel = "root" }: CreateFileModalProps) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Convert FileList to Array and add client_file_id for each file
    const handleFilePick = (files?: FileList | File[]) => {
        if (!files || files.length === 0) {
            return;
        }

        setSelectedFiles(Array.from(files));
    };

    // Handle file input change
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleFilePick(event.target.files ?? undefined);
        event.target.value = "";
    };

    // Handle file drop
    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        handleFilePick(event.dataTransfer.files ?? undefined);
    };

    // Handle submit -> Call with flow: PresignUpload -> SignUpload -> UploadFileToStorage -> CompleteUpload
    const handleSubmit = async () => {
        if (selectedFiles.length === 0 || isSubmitting) {
            return;
        }
        onSubmit?.(selectedFiles);

    };

    // Remove a file from selected files
    const handleRemoveFile = (targetFile: File) => {
        setSelectedFiles((previous) =>
            previous.filter(
                (file) => !(file.name === targetFile.name && file.lastModified === targetFile.lastModified)
            )
        );
    };

    const totalSelectedSize = useMemo(() => {
        if (!selectedFiles) return 0;
        return selectedFiles.reduce((total, file) => total + file.size, 0);
    }, [selectedFiles]);

    useEffect(() => {
        if (!isOpen) {
            setSelectedFiles([]);
            setIsDragging(false);
            setIsSubmitting(false);
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2937]/45 px-4 py-6">
            <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow">
                <div className="flex items-center justify-between border-b border-gray-300/90 px-6 py-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Tải file lên</h3>
                        <p className="mt-1 text-sm text-gray-500">Kéo thả hoặc chọn nhiều file từ máy của bạn.</p>
                    </div>
                    <Button

                        className="rounded-md border border-gray-300/90 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                        onClick={onClose}
                    >
                        Đóng
                    </Button>
                </div>

                <div className="space-y-4 px-6 py-5">
                    <div
                        className={`flex min-h-52 flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition ${isDragging ? "border-[#1a73e8] bg-[#f8fbff]" : "border-gray-300/90 bg-white"
                            }`}
                        onDragEnter={(event) => {
                            event.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragOver={(event) => {
                            event.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                    >
                        <div className="grid h-16 w-16 place-items-center rounded-lg bg-[#e8f0fe] text-2xl font-bold text-blue-500">
                            +
                        </div>
                        <h4 className="mt-5 text-xl font-semibold text-gray-900">Kéo thả file vào đây</h4>
                        <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                            Hỗ trợ chọn một hoặc nhiều file cùng lúc.
                        </p>

                        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
                            <Button
                                className="rounded-md bg-[#1a73e8] px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isSubmitting}
                            >
                                Chọn file từ máy
                            </Button>
                            <Button
                                className="rounded-md border border-gray-300/90 bg-white px-3 py-2 text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={() => {
                                    setSelectedFiles([]);
                                    fileInputRef.current && (fileInputRef.current.value = "");
                                }}
                                disabled={selectedFiles.length === 0 || isSubmitting}
                            >
                                Bỏ chọn
                            </Button>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="rounded-xl border border-gray-300/90 bg-white p-4">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-gray-900">Danh sách file đã chọn ({selectedFiles.length})</p>
                            <p className="text-xs text-gray-500">Tổng dung lượng: {formatFileSize(totalSelectedSize)}</p>
                        </div>
                        {selectedFiles.length > 0 ? (
                            <div className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-1">
                                {selectedFiles.map((file) => (
                                    <div key={`${file.name}-${file.lastModified}`} className="rounded-md border border-gray-300/90 bg-sky-50/30 px-3 py-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-gray-900">{file.name}</p>
                                                <p className="mt-1 text-xs text-gray-500">{file.type || "Không xác định"} - {formatFileSize(file.size)}</p>
                                            </div>
                                            <Button
                                                className="rounded-md border border-gray-300/90 bg-white px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                                                onClick={() => handleRemoveFile(file)}
                                                aria-label={`Xóa ${file.name}`}
                                                title="Xóa file"
                                            >
                                                <i className="fa-solid fa-trash"></i>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-3 text-sm text-gray-500">Chưa có file nào được chọn.</p>
                        )}
                    </div>

                    <div className="rounded-xl border border-gray-300/90 bg-white p-4 text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">Thư mục:</span> {destinationLabel}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-gray-300/90 px-6 py-4">
                    <Button
                        onClick={onClose}
                        className="rounded-md border border-gray-300/90 px-4 py-2 text-gray-900 hover:bg-gray-50"
                        type="button"
                        disabled={isSubmitting}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        type="button"
                        className="rounded-md bg-[#1a73e8] px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={selectedFiles.length === 0 || isSubmitting}
                    >
                        {isSubmitting ? "Đang tải..." : "Tải file lên"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateFileModal;