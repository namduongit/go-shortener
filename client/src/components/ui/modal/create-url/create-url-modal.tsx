import { useEffect, useState, type FormEvent } from "react";
import Button from "../../button/button";

export type CreateUrlPayload = {
    url: string;
    description: string;
};

interface CreateUrlModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: CreateUrlPayload) => void;
    submitting?: boolean;
}

const CreateUrlModal = ({ isOpen, onClose, onSubmit, submitting = false }: CreateUrlModalProps) => {
    const [originalUrl, setOriginalUrl] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (!isOpen) {
            setOriginalUrl("");
            setDescription("");
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!originalUrl.trim()) {
            return;
        }

        onSubmit({
            url: originalUrl.trim(),
            description: description.trim(),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2937]/40 px-4">
            <div className="w-full max-w-2xl rounded-3xl border border-[#d9e1ef] bg-white p-6 shadow-[0_28px_80px_rgba(34,61,102,0.2)] md:p-8">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5f6368]">Tạo URL mới</p>
                        <h3 className="mt-2 text-2xl font-semibold text-[#202124]">Rút gọn đường dẫn</h3>
                        <p className="mt-1 text-sm text-[#5f6368]">Nhập link gốc, mã rút gọn sẽ được server tự tạo.</p>
                    </div>
                    <Button variant="ghost" className="px-3 py-2" onClick={onClose}>
                        Đóng
                    </Button>
                </div>

                <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                    <label className="block text-sm font-semibold text-[#202124]">
                        URL gốc
                        <input
                            type="url"
                            required
                            value={originalUrl}
                            onChange={(event) => setOriginalUrl(event.target.value)}
                            className="mt-2 w-full rounded-xl border border-[#d9e1ef] bg-white px-4 py-3 text-sm text-[#202124] outline-none transition focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/15"
                            placeholder="https://example.com/your-long-link"
                        />
                    </label>

                    <label className="block text-sm font-semibold text-[#202124]">
                        Mô tả
                        <textarea
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            rows={3}
                            className="mt-2 w-full rounded-xl border border-[#d9e1ef] bg-white px-4 py-3 text-sm text-[#202124] outline-none transition focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/15"
                            placeholder="Mô tả ngắn cho link này"
                        />
                    </label>

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                        <Button type="button" variant="secondary" className="px-5 py-2.5" onClick={onClose}>
                            Hủy
                        </Button>
                        <Button type="submit" className="px-5 py-2.5" disabled={submitting}>
                            {submitting ? "Đang tạo..." : "Tạo URL"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateUrlModal;