import { type FormEvent, useEffect, useState } from "react";
import Button from "../../button/button";

interface CreateFolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (folderName: string) => void;
}

const CreateFolderModal = ({ isOpen, onClose, onSubmit }: CreateFolderModalProps) => {
    const [folderName, setFolderName] = useState("");

    useEffect(() => {
        if (!isOpen) {
            setFolderName("");
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!folderName.trim()) {
            return;
        }
        onSubmit?.(folderName.trim());
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2937]/40 px-4">
            <div className="w-full max-w-md rounded-3xl border border-[#d9e1ef] bg-white p-6 shadow-[0_35px_120px_rgba(34,61,102,0.18)] flex flex-col gap-5">

                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5f6368]">Tạo thư mục</p>
                        <h3 className="mt-2 text-2xl font-semibold text-[#202124]">Đặt tên thư mục mới</h3>
                    </div>
                    <Button
                        variant="ghost"
                        className="px-3 py-1 text-xs"
                        onClick={onClose}
                    >
                        Đóng
                    </Button>
                </div>

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <label className="text-sm font-semibold text-[#202124]">
                        Tên thư mục
                        <input
                            type="text"
                            className="mt-2 w-full rounded-2xl border border-[#d9e1ef] bg-white px-4 py-3 text-sm text-[#202124] placeholder:text-[#80868b] focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/15"
                            placeholder="Ví dụ: Báo cáo Q2"
                            value={folderName}
                            onChange={(event) => setFolderName(event.target.value)}
                        />
                    </label>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            className="rounded-2xl px-4 py-2"
                            onClick={onClose}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            className="rounded-2xl px-5 py-2"
                        >
                            Tạo thư mục
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateFolderModal;
