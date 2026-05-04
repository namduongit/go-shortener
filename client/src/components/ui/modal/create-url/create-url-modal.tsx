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

    if (!isOpen) return null;

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!originalUrl.trim()) return;
        onSubmit({ url: originalUrl.trim(), description: description.trim() });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2937]/45 px-4 py-6">
            <form
                className="flex w-full max-w-lg flex-col overflow-hidden rounded-lg bg-white shadow"
                onSubmit={handleSubmit}
            >
                <div className="flex items-center justify-between border-b border-gray-300/90 px-6 py-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Rút gọn đường dẫn</h3>
                        <p className="mt-1 text-sm text-gray-500">Nhập link gốc, mã rút gọn sẽ được server tự tạo.</p>
                    </div>
                    <Button
                        className="rounded-md border border-gray-300/90 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        Đóng
                    </Button>
                </div>

                <div className="space-y-4 px-6 py-5">
                    <label className="block text-sm font-semibold text-gray-900">
                        URL gốc
                        <input
                            type="url"
                            required
                            value={originalUrl}
                            onChange={(e) => setOriginalUrl(e.target.value)}
                            className="mt-2 w-full rounded-lg border border-gray-300/90 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/15"
                            placeholder="https://example.com/your-long-link"
                            autoFocus
                            disabled={submitting}
                        />
                    </label>

                    <label className="block text-sm font-semibold text-gray-900">
                        Mô tả
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="mt-2 w-full resize-none rounded-lg border border-gray-300/90 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/15"
                            placeholder="Mô tả ngắn cho link này (tuỳ chọn)"
                            disabled={submitting}
                        />
                    </label>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-gray-300/90 px-6 py-4">
                    <Button
                        type="button"
                        onClick={onClose}
                        className="rounded-md border border-gray-300/90 px-4 py-1.5 text-gray-900 hover:bg-gray-50"
                        disabled={submitting}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="submit"
                        className="rounded-md bg-[#1a73e8] px-5 py-1.5 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={!originalUrl.trim() || submitting}
                    >
                        {submitting ? "Đang tạo..." : "Tạo URL"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateUrlModal;