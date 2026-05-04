import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { useAuthenticate } from "../../common/hooks/useAuthenticate";
import { useExecute } from "../../common/hooks/useExecute";
import { useNotificate } from "../../common/hooks/useNotificate";
import Button from "../../components/ui/button/button";
import { ProfileModule } from "../../services/modules/profile.module";
import type { ProfileResponse, UpdateProfileForm } from "../../services/types/profile.type";

const inputCls =
    "mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/10 transition-colors";

const defaultForm: UpdateProfileForm = {
    username: "",
    avatar_url: "",
    full_name: "",
    company_name: "",
    address: "",
    phone: "",
};

// Fallback initials avatar
const getInitials = (name: string, email: string) => {
    if (name.trim()) {
        return name.trim().split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    }
    return (email?.[0] ?? "U").toUpperCase();
};

const AccountInfoPage = () => {
    const authenticate = useAuthenticate();
    const notificate = useNotificate();
    const { execute: getProfile, loading: loadingProfile } = useExecute<ProfileResponse>();
    const { execute: saveProfile, loading: saving } = useExecute<ProfileResponse>();

    const [form, setForm] = useState<UpdateProfileForm>(defaultForm);

    const email = authenticate.state?.email ?? "";
    const planName = authenticate.state?.plan?.name ?? "Free";

    useEffect(() => {
        void getProfile(() => ProfileModule.GetProfile(), {
            onSuccess: (p) => {
                setForm({
                    username: p.username ?? "",
                    avatar_url: p.avatar_url ?? "",
                    full_name: p.full_name ?? "",
                    company_name: p.company_name ?? "",
                    address: p.address ?? "",
                    phone: p.phone ?? "",
                });
            },
            onError: () => {
                notificate.showToast({
                    type: "error",
                    title: "Không tải được hồ sơ",
                    message: "Vui lòng thử tải lại trang.",
                });
            },
        });
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await saveProfile(() => ProfileModule.UpdateProfile(form), {
            onSuccess: (p) => {
                setForm({
                    username: p.username ?? "",
                    avatar_url: p.avatar_url ?? "",
                    full_name: p.full_name ?? "",
                    company_name: p.company_name ?? "",
                    address: p.address ?? "",
                    phone: p.phone ?? "",
                });
                notificate.showToast({ type: "success", title: "Đã lưu", message: "Hồ sơ đã được cập nhật." });
            },
            onError: () => {
                notificate.showToast({ type: "error", title: "Lỗi", message: "Không thể lưu. Vui lòng thử lại." });
            },
        });
    };

    const initials = getInitials(form.full_name, email);
    const hasAvatar = form.avatar_url.trim().length > 0;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-5 border-b border-gray-100 pb-6">
                <div className="relative shrink-0">
                    {hasAvatar ? (
                        <img
                            src={form.avatar_url}
                            alt={form.full_name || email}
                            className="h-20 w-20 rounded-full object-cover border border-gray-200"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1a73e8] text-2xl font-bold text-white select-none">
                            {initials}
                        </div>
                    )}
                </div>

                <div className="min-w-0">
                    <h1 className="text-xl font-semibold text-gray-900 leading-tight truncate">
                        {form.full_name || email}
                    </h1>
                    <p className="mt-0.5 text-sm text-gray-500 truncate">{email}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                            <i className="fa-regular fa-gem text-[10px]" />
                            {planName}
                        </span>
                        {form.username && (
                            <span className="text-xs text-gray-400">@{form.username}</span>
                        )}
                    </div>
                </div>

                <div className="ml-auto hidden sm:block">
                    <Button
                        type="submit"
                        disabled={loadingProfile || saving}
                        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
                    >
                        {saving ? "Đang lưu…" : "Lưu thay đổi"}
                    </Button>
                </div>
            </div>

            <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="text-sm font-medium text-gray-700" htmlFor="full_name">
                            Họ và tên
                        </label>
                        <input
                            id="full_name"
                            name="full_name"
                            className={inputCls}
                            value={form.full_name}
                            onChange={handleChange}
                            placeholder="Nhập họ và tên"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700" htmlFor="username">
                            Username
                        </label>
                        <input
                            id="username"
                            name="username"
                            className={inputCls}
                            value={form.username}
                            onChange={handleChange}
                            placeholder="Nhập username"
                        />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="text-sm font-medium text-gray-700" htmlFor="company_name">
                            Công ty
                        </label>
                        <input
                            id="company_name"
                            name="company_name"
                            className={inputCls}
                            value={form.company_name}
                            onChange={handleChange}
                            placeholder="Nhập tên công ty"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700" htmlFor="phone">
                            Số điện thoại
                        </label>
                        <input
                            id="phone"
                            name="phone"
                            className={inputCls}
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="Nhập số điện thoại"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700" htmlFor="avatar_url">
                        Avatar URL
                    </label>
                    <input
                        id="avatar_url"
                        name="avatar_url"
                        className={inputCls}
                        value={form.avatar_url}
                        onChange={handleChange}
                        placeholder="https://..."
                    />
                    <p className="mt-1 text-xs text-gray-400">
                        Nhập URL ảnh để hiển thị avatar. Bỏ trống sẽ dùng chữ viết tắt.
                    </p>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700" htmlFor="address">
                        Địa chỉ
                    </label>
                    <textarea
                        id="address"
                        name="address"
                        rows={3}
                        className={`${inputCls} resize-none`}
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Nhập địa chỉ"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4 sm:hidden">
                <p className="text-xs text-gray-400">
                    {loadingProfile ? "Đang tải…" : "Thay đổi sẽ được lưu ngay."}
                </p>
                <Button
                    type="submit"
                    disabled={loadingProfile || saving}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
                >
                    {saving ? "Đang lưu…" : "Lưu thay đổi"}
                </Button>
            </div>
        </form>
    );
};

export default AccountInfoPage;
