import { type FormEvent, useMemo, useState } from "react";
import { useNotificate } from "../../common/hooks/useNotificate";
import Button from "../../components/ui/button/button";

type TokenStatus = "active" | "revoked";

type ApiToken = {
    id: string;
    token: string;
    note: string;
    status: TokenStatus;
    created_at: string;
};

const STORAGE_KEY = "GO_API_TOKENS";

const formatDateTime = (isoValue: string) => {
    const date = new Date(isoValue);
    if (Number.isNaN(date.getTime())) {
        return "--";
    }

    return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
};

const createTokenValue = () => {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);

    const hex = Array.from(bytes)
        .map((value) => value.toString(16).padStart(2, "0"))
        .join("");

    return `gms_${hex}`;
};

const readTokenStorage = (): ApiToken[] => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        return [];
    }

    try {
        const parsed = JSON.parse(raw) as ApiToken[];
        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed;
    } catch {
        return [];
    }
};

const saveTokenStorage = (items: ApiToken[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const AccountApiPage = () => {
    const notificate = useNotificate();
    const [note, setNote] = useState<string>("");
    const [tokens, setTokens] = useState<ApiToken[]>(() => readTokenStorage());

    const tokenCountLabel = useMemo(() => {
        if (tokens.length === 0) {
            return "Chưa có token nào";
        }

        if (tokens.length === 1) {
            return "1 token";
        }

        return `${tokens.length} token`;
    }, [tokens.length]);

    const handleCreateToken = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmed = note.trim();
        if (!trimmed) {
            notificate.showToast({
                type: "warning",
                title: "Thiếu ghi chú",
                message: "Vui lòng nhập ghi chú để dễ quản lý token."
            });
            return;
        }

        const newToken: ApiToken = {
            id: crypto.randomUUID?.() ?? `${Date.now()}`,
            token: createTokenValue(),
            note: trimmed,
            status: "active",
            created_at: new Date().toISOString()
        };

        const nextTokens = [newToken, ...tokens];
        setTokens(nextTokens);
        saveTokenStorage(nextTokens);
        setNote("");

        notificate.showToast({
            type: "success",
            title: "Tạo token thành công",
            message: "Token mới đã được thêm vào danh sách."
        });
    };

    const handleCopyToken = async (token: string) => {
        try {
            await navigator.clipboard.writeText(token);
            notificate.showToast({
                type: "success",
                title: "Đã copy token",
                message: "Token đã được sao chép vào clipboard."
            });
        } catch {
            notificate.showToast({
                type: "error",
                title: "Không thể copy",
                message: "Trình duyệt không cho phép copy tự động."
            });
        }
    };

    const handleDeleteToken = (id: string) => {
        const nextTokens = tokens.filter((item) => item.id !== id);
        setTokens(nextTokens);
        saveTokenStorage(nextTokens);
        notificate.showToast({
            type: "info",
            title: "Đã xóa token",
            message: "Token đã được gỡ khỏi danh sách."
        });
    };

    return (
        <div className="space-y-5">
            <header className="rounded-3xl border border-gray-300/90 bg-[#f8fbff] p-5 md:p-7">
                <p className="text-sm font-semibold text-gray-500">API</p>
                <h1 className="mt-1 text-3xl font-semibold text-gray-900 md:text-4xl">Access token</h1>
                <p className="mt-2 text-sm text-gray-500">
                    Tạo token theo ghi chú để chuẩn bị cho luồng truy cập API upload/xóa file. Hiện tại đây là bản demo local, sẵn sàng thay bằng API server sau.
                </p>
            </header>

            <section className="rounded-3xl border border-gray-300/90 bg-white p-5 md:p-7">
                <form className="grid gap-3 md:grid-cols-[1fr_auto]" onSubmit={handleCreateToken}>
                    <div>
                        <label htmlFor="note" className="text-sm font-semibold text-gray-900">Ghi chú token</label>
                        <input
                            id="note"
                            name="note"
                            value={note}
                            onChange={(event) => setNote(event.target.value)}
                            placeholder="Ví dụ: Firebase sync worker"
                            className="mt-2 w-full rounded-xl border border-gray-300/90 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/15"
                        />
                    </div>
                    <div className="flex items-end">
                        <Button type="submit" className="h-11 px-6">Tạo token mới</Button>
                    </div>
                </form>
            </section>

            <section className="overflow-hidden rounded-3xl border border-gray-300/90 bg-white">
                <div className="flex items-center justify-between border-b border-[#edf1f7] px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">Danh sách token</p>
                    <p className="text-sm text-gray-500">{tokenCountLabel}</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-190 text-left text-sm text-gray-900">
                        <thead className="bg-white text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3">Token</th>
                                <th className="px-4 py-3">Trạng thái</th>
                                <th className="px-4 py-3">Ghi chú</th>
                                <th className="px-4 py-3">Tạo lúc</th>
                                <th className="px-4 py-3 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tokens.length === 0 ? (
                                <tr>
                                    <td className="px-4 py-8 text-center text-gray-500" colSpan={5}>
                                        Chưa có token nào. Hãy tạo token đầu tiên để dùng cho các luồng API sau này.
                                    </td>
                                </tr>
                            ) : (
                                tokens.map((item, index) => (
                                    <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-[#fcfdff]"}>
                                        <td className="px-4 py-4">
                                            <code className="rounded-md bg-[#f5f7fb] px-2 py-1 text-xs text-[#1f3a66]">
                                                {item.token.slice(0, 16)}...{item.token.slice(-8)}
                                            </code>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="inline-flex rounded-full bg-[#e6f4ea] px-2.5 py-1 text-xs font-semibold text-[#137333]">
                                                {item.status === "active" ? "Active" : "Revoked"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-gray-500">{item.note}</td>
                                        <td className="px-4 py-4 text-gray-500">{formatDateTime(item.created_at)}</td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="inline-flex gap-2">
                                                <Button type="button" className="rounded-md border border-gray-300/90 bg-white px-3 py-1.5 text-xs text-gray-900 hover:bg-gray-50" onClick={() => void handleCopyToken(item.token)}>
                                                    Copy
                                                </Button>
                                                <Button type="button" className="rounded-md border border-gray-300/90 bg-white px-3 py-1.5 text-xs text-[#b3261e] hover:bg-gray-50" onClick={() => handleDeleteToken(item.id)}>
                                                    Xóa
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default AccountApiPage;
