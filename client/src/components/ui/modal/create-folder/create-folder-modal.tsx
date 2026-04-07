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
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow flex flex-col gap-5">

                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Tạo thư mục</p>
                        <h3 className="mt-2 text-2xl font-semibold text-gray-900">Đặt tên thư mục mới</h3>
                    </div>
                    <Button
                        className="rounded-md border border-gray-300/90 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                        onClick={onClose}
                    >
                        Đóng
                    </Button>
                </div>

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <label className="text-sm font-semibold text-gray-900">
                        Tên thư mục
                        <input
                            type="text"
                            className="mt-2 w-full rounded-2xl border border-gray-300/90 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/15"
                            placeholder="Ví dụ: Báo cáo Q2"
                            value={folderName}
                            onChange={(event) => setFolderName(event.target.value)}
                        />
                    </label>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            className="rounded-md border border-gray-300/90 bg-white px-4 py-2 text-gray-900 hover:bg-gray-50"
                            onClick={onClose}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            className="rounded-md bg-[#1a73e8] px-5 py-2 text-white hover:bg-blue-700"
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
