import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import Button from "../../components/ui/button/button";
import { useExecute } from "../../common/hooks/useExecute";
import { useNotificate } from "../../common/hooks/useNotificate";
import { AuthModule } from "../../services/modules/auth.module";
import { TokenModule } from "../../services/modules/token.module";
import type { ChangePasswordForm } from "../../services/types/auth.type";
import type { ActivityLogResponse } from "../../services/types/token.type";
import { useAuthenticate } from "../../common/hooks/useAuthenticate";

const inputCls =
    "mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/10 transition-colors";

const defaultForm: ChangePasswordForm = {
    current_password: "",
    new_password: "",
    password_confirm: "",
};

const logMeta: Record<string, { icon: string; color: string }> = {
    login:           { icon: "fa-solid fa-arrow-right-to-bracket", color: "text-blue-500 bg-blue-50 border-blue-200" },
    change_password: { icon: "fa-solid fa-key",                    color: "text-amber-600 bg-amber-50 border-amber-200" },
    create_token:    { icon: "fa-solid fa-terminal",               color: "text-purple-600 bg-purple-50 border-purple-200" },
};

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Vừa xong";
    if (m < 60) return `${m} phút trước`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} giờ trước`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d} ngày trước`;
    return `${Math.floor(d / 30)} tháng trước`;
}

const SecurityPage = () => {
    const { ChangePassword } = AuthModule;
    const { state, clearState } = useAuthenticate();
    const notificate = useNotificate();
    const { execute, loading } = useExecute<null>();
    const { executeWithDeclareResponse: fetchApi } = useExecute();

    const [form, setForm] = useState<ChangePasswordForm>(defaultForm);

    // Activity logs
    const [logs, setLogs] = useState<ActivityLogResponse[]>([]);
    const [logsLoading, setLogsLoading] = useState(true);

    useEffect(() => {
        fetchApi(() => TokenModule.GetActivityLogs(50), {
            onSuccess: (data) => setLogs(data ?? []),
            onError: () => setLogs([]),
        }).finally(() => setLogsLoading(false));
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!form.current_password || !form.new_password || !form.password_confirm) {
            notificate.showToast({ type: "error", title: "Thiếu thông tin", message: "Vui lòng điền đầy đủ các trường." });
            return;
        }
        if (form.new_password !== form.password_confirm) {
            notificate.showToast({ type: "error", title: "Không khớp", message: "Mật khẩu mới và xác nhận phải giống nhau." });
            return;
        }

        await execute(() => ChangePassword(form), {
            onSuccess: () => {
                setForm(defaultForm);
                notificate.showToast({ type: "success", title: "Đổi mật khẩu thành công", message: "Bạn sẽ được đăng xuất để đăng nhập lại." });
                setTimeout(() => { clearState(); window.location.href = "/auth/login"; }, 2000);
            },
            onError: () => notificate.showToast({ type: "error", title: "Đổi mật khẩu thất bại", message: "Mật khẩu hiện tại không đúng hoặc có lỗi xảy ra." }),
        });
    };

    return (
        <div className="space-y-5">
            {/* Page header */}
            <div>
                <h1 className="text-xl font-semibold text-gray-900">Bảo mật</h1>
                <p className="mt-0.5 text-sm text-gray-500">Quản lý mật khẩu và xem lịch sử hoạt động tài khoản.</p>
            </div>

            {/* Account info card */}
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1a73e8] text-sm font-bold text-white">
                    {(state?.email?.[0] ?? "U").toUpperCase()}
                </span>
                <div>
                    <p className="text-sm font-semibold text-gray-900">{state?.email ?? "—"}</p>
                    <p className="text-xs text-gray-400">Gói: {state?.plan?.name ?? "Free"}</p>
                </div>
            </div>

            {/* Change password form */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-5 py-3.5">
                    <p className="text-sm font-semibold text-gray-900">Đổi mật khẩu</p>
                    <p className="mt-0.5 text-xs text-gray-400">
                        Sau khi đổi thành công, bạn sẽ được đăng xuất và cần đăng nhập lại.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-4 p-5 sm:grid-cols-3">
                    <div>
                        <label className="text-sm font-medium text-gray-700" htmlFor="current_password">Mật khẩu hiện tại</label>
                        <input id="current_password" name="current_password" type="password" className={inputCls} placeholder="Nhập mật khẩu hiện tại" value={form.current_password} onChange={handleChange} autoComplete="current-password" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700" htmlFor="new_password">Mật khẩu mới</label>
                        <input id="new_password" name="new_password" type="password" className={inputCls} placeholder="Tối thiểu 8 ký tự" value={form.new_password} onChange={handleChange} autoComplete="new-password" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700" htmlFor="password_confirm">Xác nhận mật khẩu</label>
                        <input id="password_confirm" name="password_confirm" type="password" className={inputCls} placeholder="Nhập lại mật khẩu mới" value={form.password_confirm} onChange={handleChange} autoComplete="new-password" />
                    </div>
                    <div className="flex items-center justify-end sm:col-span-3">
                        <Button type="submit" disabled={loading} className="rounded-lg bg-[#1a73e8] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-60">
                            {loading ? "Đang xử lý…" : "Đổi mật khẩu"}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Activity logs */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Lịch sử hoạt động</p>
                        <p className="mt-0.5 text-xs text-gray-400">Các lần đăng nhập và thay đổi bảo mật gần đây.</p>
                    </div>
                    {!logsLoading && <span className="text-xs text-gray-400">{logs.length} mục</span>}
                </div>

                {logsLoading ? (
                    <div className="flex justify-center py-8">
                        <i className="fa-solid fa-spinner fa-spin text-gray-400" />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                        <i className="fa-solid fa-clock-rotate-left text-2xl text-gray-300" />
                        <p className="mt-2 text-sm text-gray-400">Chưa có hoạt động nào được ghi nhận.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {logs.map((log) => {
                            const meta = logMeta[log.action] ?? { icon: "fa-solid fa-circle-info", color: "text-gray-500 bg-gray-50 border-gray-200" };
                            return (
                                <div key={log.uuid} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                                    <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md border text-xs ${meta.color}`}>
                                        <i className={meta.icon} />
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-800">{log.detail}</p>
                                        {log.ip_address && (
                                            <p className="mt-0.5 text-xs text-gray-400">IP: {log.ip_address}</p>
                                        )}
                                    </div>
                                    <span className="shrink-0 text-xs text-gray-400">{timeAgo(log.created_at)}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SecurityPage;
