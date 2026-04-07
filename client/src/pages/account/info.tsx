import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { useAuthenticate } from "../../common/hooks/useAuthenticate";
import { useExecute } from "../../common/hooks/useExecute";
import { useNotificate } from "../../common/hooks/useNotificate";
import Button from "../../components/ui/button/button";
import { ProfileModule } from "../../services/modules/profile.module";
import type { ProfileResponse, UpdateProfileForm } from "../../services/types/profile.type";

const inputClasses =
    "mt-2 w-full rounded-xl border border-gray-300/90 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/15";

const defaultForm: UpdateProfileForm = {
    username: "",
    avatar_url: "",
    full_name: "",
    company_name: "",
    address: "",
    phone: ""
};

const AccountInfoPage = () => {
    const authenticate = useAuthenticate();
    const notificate = useNotificate();
    const { execute: executeGetProfile, loading: loadingProfile } = useExecute<ProfileResponse>();
    const { execute: executeUpdateProfile, loading: savingProfile } = useExecute<ProfileResponse>();

    const [form, setForm] = useState<UpdateProfileForm>(defaultForm);

    useEffect(() => {
        void executeGetProfile(() => ProfileModule.GetProfile(), {
            onSuccess: (profile: ProfileResponse) => {
                setForm({
                    username: profile.username ?? "",
                    avatar_url: profile.avatar_url ?? "",
                    full_name: profile.full_name ?? "",
                    company_name: profile.company_name ?? "",
                    address: profile.address ?? "",
                    phone: profile.phone ?? ""
                });
            },
            onError: () => {
                notificate.showToast({
                    type: "error",
                    title: "Không tải được hồ sơ",
                    message: "Vui lòng thử tải lại trang hoặc kiểm tra đăng nhập."
                });
            }
        });
    }, []);

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        await executeUpdateProfile(() => ProfileModule.UpdateProfile(form), {
            onSuccess: (profile: ProfileResponse) => {
                setForm({
                    username: profile.username ?? "",
                    avatar_url: profile.avatar_url ?? "",
                    full_name: profile.full_name ?? "",
                    company_name: profile.company_name ?? "",
                    address: profile.address ?? "",
                    phone: profile.phone ?? ""
                });

                notificate.showToast({
                    type: "success",
                    title: "Đã cập nhật hồ sơ",
                    message: "Thông tin tài khoản đã được lưu thành công."
                });
            },
            onError: () => {
                notificate.showToast({
                    type: "error",
                    title: "Cập nhật thất bại",
                    message: "Không thể lưu hồ sơ. Vui lòng thử lại."
                });
            }
        });
    };

    return (
        <div className="space-y-5">
            <header className="rounded-3xl border border-gray-300/90 bg-[#f8fbff] p-5 md:p-7">
                <p className="text-sm font-semibold text-gray-500">Tài khoản</p>
                <h1 className="mt-1 text-3xl font-semibold text-gray-900 md:text-4xl">Thông tin hồ sơ</h1>
                <p className="mt-2 text-sm text-gray-500">Email lấy từ phiên đăng nhập và không chỉnh sửa. Các thông tin khác có thể cập nhật trực tiếp.</p>
            </header>

            <form className="rounded-3xl border border-gray-300/90 bg-white p-5 md:p-7" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="text-sm font-semibold text-gray-900" htmlFor="email">Email</label>
                        <input id="email" name="email" className={`${inputClasses} bg-[#f6f8fc]`} value={authenticate.state?.email} disabled readOnly />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-900" htmlFor="plan">Gói hiện tại</label>
                        <input id="plan" name="plan" className={`${inputClasses} bg-[#f6f8fc]`} value={authenticate.state?.plan?.name} disabled readOnly />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-900" htmlFor="full_name">Họ và tên</label>
                        <input id="full_name" name="full_name" className={inputClasses} value={form.full_name} onChange={handleChange} placeholder="Nhập họ và tên" />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-900" htmlFor="username">Username</label>
                        <input id="username" name="username" className={inputClasses} value={form.username} onChange={handleChange} placeholder="Nhập username" />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-900" htmlFor="company_name">Công ty</label>
                        <input id="company_name" name="company_name" className={inputClasses} value={form.company_name} onChange={handleChange} placeholder="Nhập tên công ty" />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-900" htmlFor="phone">Số điện thoại</label>
                        <input id="phone" name="phone" className={inputClasses} value={form.phone} onChange={handleChange} placeholder="Nhập số điện thoại" />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-sm font-semibold text-gray-900" htmlFor="address">Địa chỉ</label>
                        <textarea id="address" name="address" className={`${inputClasses} min-h-28 resize-y`} value={form.address} onChange={handleChange} placeholder="Nhập địa chỉ" />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-sm font-semibold text-gray-900" htmlFor="avatar_url">Avatar URL</label>
                        <input id="avatar_url" name="avatar_url" className={inputClasses} value={form.avatar_url} onChange={handleChange} placeholder="https://..." />
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-3">
                    <p className="text-sm text-gray-500">{loadingProfile ? "Đang tải hồ sơ..." : "Bạn có thể cập nhật và lưu thông tin bất kỳ lúc nào."}</p>
                    <Button type="submit" disabled={loadingProfile || savingProfile}>
                        {savingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AccountInfoPage;
