import { type FormEvent, useEffect, useState } from "react";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c1915]/60 px-4">
            <div className="w-full max-w-md rounded-3xl border border-[#ded7c7] bg-white/95 p-6 shadow-[0_35px_120px_rgba(14,12,10,0.35)]">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.45em] text-[#8b714c]">Tạo thư mục</p>
                        <h3 className="mt-2 text-2xl font-serif text-[#1f1d19]">Đặt tên thư mục mới</h3>
                    </div>
                    <button
                        className="rounded-full border border-[#e2dacb] px-3 py-1 text-xs font-semibold text-[#2d2a26] hover:bg-[#fbf8f1]"
                        onClick={onClose}
                    >
                        Đóng
                    </button>
                </div>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <label className="text-sm font-semibold text-[#2d2a26]">
                        Tên thư mục
                        <input
                            type="text"
                            className="mt-2 w-full rounded-2xl border border-[#c2b8a8] bg-white px-4 py-3 text-sm text-[#2d2a26] placeholder:text-[#9c9688] focus:border-[#2d2a26] focus:outline-none focus:ring-2 focus:ring-[#b79c6d]/30"
                            placeholder="Ví dụ: Báo cáo Q2"
                            value={folderName}
                            onChange={(event) => setFolderName(event.target.value)}
                        />
                    </label>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            className="rounded-2xl border border-[#d4ccbd] px-4 py-2 text-sm font-semibold text-[#2d2a26] hover:bg-[#fbf8f1]"
                            onClick={onClose}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="rounded-2xl bg-[#2d2a26] px-5 py-2 text-sm font-semibold tracking-wide text-white hover:bg-[#1c1915]"
                        >
                            Tạo thư mục
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateFolderModal;
