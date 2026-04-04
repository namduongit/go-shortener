import { useEffect, useRef, useState, type DragEvent } from "react";
import Button from "../../button/button";

interface CreateFileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (file: File) => void;
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

        onSubmit?.(selectedFile);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2937]/45 px-4 py-6">
            <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[#d9e1ef] bg-white shadow-[0_35px_120px_rgba(34,61,102,0.22)]">
                <div className="flex items-start justify-between border-b border-[#e5eaf4] px-6 py-5 md:px-8">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5f6368]">Tải tệp lên</p>
                        <h3 className="mt-2 text-2xl font-semibold text-[#202124]">Chọn file từ máy hoặc kéo thả vào đây</h3>
                        <p className="mt-2 text-sm text-[#5f6368]">Tệp sẽ được lưu vào <span className="font-semibold text-[#202124]">{destinationLabel}</span> sau khi bạn xác nhận.</p>
                    </div>
                    <button
                        type="button"
                        className="rounded-full border border-[#d9e1ef] px-3 py-2 text-sm font-semibold text-[#202124] transition hover:bg-[#f8f9fa]"
                        onClick={onClose}
                    >
                        Đóng
                    </button>
                </div>

                <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.2fr_0.8fr] md:px-8">
                    <div
                        className={`flex min-h-80 flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-8 text-center transition ${
                            isDragging ? "border-[#1a73e8] bg-[#f8fbff]" : "border-[#d9e1ef] bg-[#fafbfd]"
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
                        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#e8f0fe] text-2xl font-bold text-[#1a73e8]">
                            +
                        </div>
                        <h4 className="mt-5 text-xl font-semibold text-[#202124]">Kéo thả file vào đây</h4>
                        <p className="mt-2 max-w-md text-sm leading-6 text-[#5f6368]">
                            Hoặc chọn trực tiếp từ máy local. Bạn chỉ upload sau khi nhấn nút xác nhận ở dưới.
                        </p>

                        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
                            <Button
                                type="button"
                                variant="primary"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Chọn file từ máy
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
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

                    <div className="rounded-3xl border border-[#e5eaf4] bg-white p-5 shadow-[0_12px_30px_rgba(34,61,102,0.06)]">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5f6368]">Thông tin file</p>

                        {selectedFile ? (
                            <div className="mt-4 space-y-4">
                                <div className="rounded-2xl border border-[#d9e1ef] bg-[#f8fbff] p-4">
                                    <p className="truncate text-sm font-semibold text-[#202124]">{selectedFile.name}</p>
                                    <p className="mt-1 text-xs text-[#5f6368]">{selectedFile.type || "Không xác định"}</p>
                                    <p className="mt-1 text-xs text-[#5f6368]">{formatFileSize(selectedFile.size)}</p>
                                </div>

                                <div className="space-y-2 rounded-2xl border border-[#e5eaf4] bg-[#fafbfd] p-4 text-sm text-[#5f6368]">
                                    <p>
                                        <span className="font-semibold text-[#202124]">Đích đến:</span> {destinationLabel}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-[#202124]">Trạng thái:</span> Chờ xác nhận upload
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Button type="button" onClick={handleSubmit} className="w-full">
                                        Tải file lên
                                    </Button>
                                    <Button type="button" variant="ghost" onClick={onClose} className="w-full border border-[#d9e1ef]">
                                        Hủy
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 rounded-2xl border border-dashed border-[#d9e1ef] bg-[#fafbfd] px-4 py-10 text-center">
                                <p className="text-sm font-semibold text-[#202124]">Chưa chọn file</p>
                                <p className="mt-2 text-sm leading-6 text-[#5f6368]">
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