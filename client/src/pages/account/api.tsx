import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import Button from "../../components/ui/button/button";
import CreateTokenModal from "../../components/ui/modal/create-token/create-token-modal";
import { useExecute } from "../../common/hooks/useExecute";
import { useNotificate } from "../../common/hooks/useNotificate";
import { TokenModule } from "../../services/modules/token.module";
import type { CreateTokenForm, TokenListResponse, TokenResponse } from "../../services/types/token.type";
import { formatDriveDate } from "../../services/utils/date";

const inputCls =
    "mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/10 transition-colors";

const defaultTokenForm: CreateTokenForm = { name: "", time: 0 };

const AccountApiPage = () => {
    const { GetTokens, CreateToken, DeleteToken, RenewToken } = TokenModule;
    const notificate = useNotificate();

    const { execute: executeGetTokens, loading: loadingTokens } = useExecute<TokenListResponse>();
    const { execute: executeCreateToken, loading: creatingToken } = useExecute<TokenResponse>();
    const { execute: executeDeleteToken } = useExecute<null>();
    const { execute: executeRenewToken } = useExecute<TokenResponse>();

    const [tokens, setTokens] = useState<TokenResponse[]>([]);
    const [form, setForm] = useState<CreateTokenForm>(defaultTokenForm);
    const [createdToken, setCreatedToken] = useState<{ publicToken: string; privateToken: string } | null>(null);

    const isExpired = (token: TokenResponse) =>
        token.expires_at ? new Date(token.expires_at).getTime() <= Date.now() : false;

    const handleCopy = async (token: string) => {
        try {
            await navigator.clipboard.writeText(token);
            notificate.showToast({ type: "success", title: "Đã sao chép", message: "Token đã được copy vào clipboard." });
        } catch {
            notificate.showToast({ type: "error", title: "Không thể sao chép", message: "Trình duyệt không cho phép." });
        }
    };

    const handleCreateToken = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!form.name.trim()) {
            notificate.showToast({ type: "error", title: "Thiếu tên token", message: "Vui lòng nhập ghi chú cho token." });
            return;
        }

        const payload: CreateTokenForm = {
            name: form.name,
            ...(form.time && form.time > 0 ? { time: form.time } : {}),
        };

        await executeCreateToken(() => CreateToken(payload), {
            onSuccess: (token) => {
                setTokens((prev) => [token, ...prev]);
                setForm(defaultTokenForm);
                if (token.private_token) {
                    setCreatedToken({ publicToken: token.public_token ?? token.token, privateToken: token.private_token });
                }
                notificate.showToast({
                    type: "success",
                    title: "Token đã được tạo",
                    message: token.private_token
                        ? "Copy private token ngay — chỉ hiển thị một lần."
                        : "Token mới sẵn sàng.",
                });
            },
            onError: () => {
                notificate.showToast({ type: "error", title: "Tạo thất bại", message: "Không thể tạo token. Vui lòng thử lại." });
            },
        });
    };

    const handleDeleteToken = async (uuid: string) => {
        const ok = await notificate.showConfirm({ title: "Xóa token", message: "Token này sẽ bị xóa vĩnh viễn và không thể khôi phục. Bạn có chắc không?" });
        if (!ok) return;

        await executeDeleteToken(() => DeleteToken(uuid), {
            onSuccess: () => {
                setTokens((prev) => prev.filter((t) => t.uuid !== uuid));
                notificate.showToast({ type: "success", title: "Đã xóa token", message: "Token đã bị gỡ khỏi tài khoản." });
            },
            onError: () => {
                notificate.showToast({ type: "error", title: "Xóa thất bại", message: "Không thể xóa token lúc này." });
            },
        });
    };

    const handleRenewToken = async (uuid: string) => {
        await executeRenewToken(() => RenewToken(uuid, 30), {
            onSuccess: (updated) => {
                setTokens((prev) => prev.map((t) => (t.uuid === uuid ? updated : t)));
                notificate.showToast({ type: "success", title: "Gia hạn thành công", message: "Token đã được gia hạn thêm 30 ngày." });
            },
            onError: () => {
                notificate.showToast({ type: "error", title: "Gia hạn thất bại", message: "Không thể gia hạn token lúc này." });
            },
        });
    };

    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: name === "time" ? Number(value) : value }));
    };

    useEffect(() => {
        void executeGetTokens(() => GetTokens(), {
            onSuccess: (data) => setTokens(data.tokens ?? []),
            onError: () => {
                setTokens([]);
                notificate.showToast({ type: "error", title: "Không tải được token", message: "Vui lòng thử lại." });
            },
        });
    }, []);

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">API Keys</h1>
                <p className="mt-0.5 text-sm text-gray-500">Tạo và quản lý token truy cập API của tài khoản.</p>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-5 py-3.5">
                    <p className="text-sm font-semibold text-gray-900">Tạo token mới</p>
                    <p className="mt-0.5 text-xs text-gray-400">Token dùng để xác thực khi gọi API từ ứng dụng bên ngoài.</p>
                </div>

                <form className="flex flex-wrap items-end gap-4 p-5" onSubmit={handleCreateToken}>
                    <div className="min-w-56 flex-1">
                        <label htmlFor="token-name" className="text-sm font-medium text-gray-700">
                            Tên / ghi chú
                        </label>
                        <input
                            id="token-name"
                            name="name"
                            value={form.name}
                            onChange={handleFormChange}
                            placeholder="Ví dụ: Firebase sync worker"
                            className={inputCls}
                        />
                    </div>

                    <div className="w-full sm:w-52">
                        <label htmlFor="expire-option" className="text-sm font-medium text-gray-700">
                            Thời hạn
                        </label>
                        <select
                            id="expire-option"
                            name="time"
                            value={String(form.time ?? 0)}
                            onChange={handleFormChange}
                            className={inputCls}
                        >
                            <option value="0">Không hết hạn</option>
                            <option value="7">7 ngày</option>
                            <option value="30">30 ngày</option>
                            <option value="90">90 ngày</option>
                        </select>
                    </div>

                    <div className="self-end pb-0.5">
                        <Button
                            type="submit"
                            disabled={creatingToken || loadingTokens}
                            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
                        >
                            <i className="fa-solid fa-plus text-xs" />
                            {creatingToken ? "Đang tạo…" : "Tạo token"}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
                    <p className="text-sm font-semibold text-gray-900">Danh sách token</p>
                    <span className="text-xs text-gray-400">
                        {loadingTokens ? "Đang tải…" : `${tokens.length} token`}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="px-5 py-2.5 text-xs font-medium uppercase tracking-wide text-gray-400">Token</th>
                                <th className="px-5 py-2.5 text-xs font-medium uppercase tracking-wide text-gray-400">Trạng thái</th>
                                <th className="px-5 py-2.5 text-xs font-medium uppercase tracking-wide text-gray-400">Ghi chú</th>
                                <th className="px-5 py-2.5 text-xs font-medium uppercase tracking-wide text-gray-400">Hết hạn</th>
                                <th className="px-5 py-2.5 text-xs font-medium uppercase tracking-wide text-gray-400 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {tokens.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">
                                        Chưa có token nào. Tạo token đầu tiên để bắt đầu sử dụng API.
                                    </td>
                                </tr>
                            ) : (
                                tokens.map((token) => (
                                    <tr key={token.uuid} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <code className="rounded-md bg-gray-100 px-2 py-1 font-mono text-xs text-gray-700">
                                                {(token.public_token ?? token.token).slice(0, 16)}…{(token.public_token ?? token.token).slice(-6)}
                                            </code>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${isExpired(token)
                                                        ? "border-red-200 bg-red-50 text-red-700"
                                                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                    }`}
                                            >
                                                <span className={`h-1.5 w-1.5 rounded-full ${isExpired(token) ? "bg-red-500" : "bg-emerald-500"}`} />
                                                {isExpired(token) ? "Hết hạn" : "Hoạt động"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-gray-600">{token.name || "—"}</td>
                                        <td className="px-5 py-3.5 text-gray-500">
                                            {token.expires_at ? formatDriveDate(token.expires_at) : "Không hết hạn"}
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="inline-flex gap-2">
                                                <Button
                                                    className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                                                    onClick={() => void handleCopy(token.public_token ?? token.token)}
                                                >
                                                    Copy
                                                </Button>
                                                {isExpired(token) && (
                                                    <Button
                                                        className="rounded-md border border-blue-200 bg-white px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 transition-colors"
                                                        onClick={() => void handleRenewToken(token.uuid)}
                                                    >
                                                        Gia hạn
                                                    </Button>
                                                )}
                                                <Button
                                                    className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
                                                    onClick={() => void handleDeleteToken(token.uuid)}
                                                >
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
            </div>

            <CreateTokenModal
                isOpen={createdToken !== null}
                publicToken={createdToken?.publicToken ?? ""}
                privateToken={createdToken?.privateToken ?? ""}
                onClose={() => setCreatedToken(null)}
                onCopyToken={handleCopy}
            />
        </div>
    );
};

export default AccountApiPage;
