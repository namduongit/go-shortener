import { useEffect, useRef, useState, type DragEvent } from "react";
import Button from "../../button/button";

interface CreateFileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (file: File) => void | Promise<void>;
    destinationLabel?: string;
}

const formatFileSize = (size: number) => {
    if (size < 1024) {
        return `${size} B`;
    }

    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const CreateFileModal = ({ isOpen, onClose, onSubmit, destinationLabel = "root" }: CreateFileModalProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setSelectedFile(null);
            setIsDragging(false);
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleFilePick = (file?: File) => {
        if (!file) {
            return;
        }

        setSelectedFile(file);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        handleFilePick(file);
        event.target.value = "";
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        handleFilePick(event.dataTransfer.files?.[0]);
    };

    const handleSubmit = () => {
        if (!selectedFile) {
            return;
        }

        void Promise.resolve(onSubmit?.(selectedFile));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2937]/45 px-4 py-6">
            <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-300/90 bg-white shadow-[0_35px_120px_rgba(34,61,102,0.22)]">
                <div className="flex items-start justify-between border-b border-gray-300/90 px-6 py-5 md:px-8">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Tải tệp lên</p>
                        <h3 className="mt-2 text-2xl font-semibold text-gray-900">Chọn file từ máy hoặc kéo thả vào đây</h3>
                        <p className="mt-2 text-sm text-gray-500">Tệp sẽ được lưu vào <span className="font-semibold text-gray-900">{destinationLabel}</span> sau khi bạn xác nhận.</p>
                    </div>
                    <Button
                        type="button"
                        className="rounded-md border border-gray-300/90 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={onClose}
                    >
                        Đóng
                    </Button>
                </div>

                <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.2fr_0.8fr] md:px-8">
                    <div
                        className={`flex min-h-80 flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition ${
                            isDragging ? "border-[#1a73e8] bg-[#f8fbff]" : "border-gray-300/90 bg-white"
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
                            Hoặc chọn trực tiếp từ máy local. File sẽ được upload khi bạn xác nhận.
                        </p>

                        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
                            <Button
                                className="rounded-md bg-[#1a73e8] px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Chọn file từ máy
                            </Button>
                            <Button
                                className="rounded-md border border-gray-300/90 bg-white px-3 py-2 text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={() => {
                                    setSelectedFile(null);
                                    fileInputRef.current && (fileInputRef.current.value = "");
                                }}
                                disabled={!selectedFile}
                            >
                                Bỏ chọn
                            </Button>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="rounded-xl border border-gray-300/90 bg-white p-5 shadow-[0_12px_30px_rgba(34,61,102,0.06)]">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Thông tin file</p>

                        {selectedFile ? (
                            <div className="mt-4 space-y-4">
                                <div className="rounded-lg border border-gray-300/90 bg-[#f8fbff] p-4">
                                    <p className="truncate text-sm font-semibold text-gray-900">{selectedFile.name}</p>
                                    <p className="mt-1 text-xs text-gray-500">{selectedFile.type || "Không xác định"}</p>
                                    <p className="mt-1 text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                                </div>

                                <div className="space-y-2 rounded-lg border border-gray-300/90 bg-white p-4 text-sm text-gray-500">
                                    <p>
                                        <span className="font-semibold text-gray-900">Đích đến:</span> {destinationLabel}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-gray-900">Trạng thái:</span> Chờ xác nhận upload
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Button
                                        type="button"
                                        onClick={handleSubmit}
                                        className="w-full rounded-md bg-[#1a73e8] px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Tải file lên
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={onClose}
                                        className="w-full rounded-md border border-gray-300/90 px-4 py-2 text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Hủy
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 rounded-lg border border-dashed border-gray-300/90 bg-white px-4 py-10 text-center">
                                <p className="text-sm font-semibold text-gray-900">Chưa chọn file</p>
                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    Kéo thả một file hoặc bấm nút chọn file để bắt đầu.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateFileModal;