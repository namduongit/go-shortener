import { type ChangeEvent, type FormEvent, useState } from "react";
import { Link } from "react-router";
import type { LoginResponse, LoginForm } from "../../../services/types/auth.type";
import { useExecute } from "../../../common/hooks/useExecute";
import { AuthModule } from "../../../services/modules/auth.module";
import { useNotificate } from "../../../common/hooks/useNotificate";
import { useAuthenticate } from "../../../common/hooks/useAuthenticate";
import PublicLayout from "../../../components/layout/public-layout";

const inputClasses =
    "mt-2 w-full rounded-xl border border-[#d9e1ef] bg-white px-4 py-3 text-sm text-[#202124] placeholder:text-[#80868b] transition focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/15";

const LoginPage = () => {
    const { Login } = AuthModule;
    const { execute } = useExecute<LoginResponse>();
    const notificate = useNotificate();
    const authenticate = useAuthenticate();

    const [form, setForm] = useState<LoginForm>({ email: "", password: "" });

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!form.email || !form.password) {
            return;
        }

        const payload = await execute(() => Login(form), {
            onError: () => {
                notificate.showToast({
                    type: "error",
                    title: "Đăng nhập thất bại",
                    message: "Vui lòng kiểm tra lại thông tin đăng nhập."
                });
            },
            onSuccess: () => {
                if (payload) {
                    authenticate.saveState(payload);
                }

                notificate.showToast({
                    type: "success",
                    title: "Thành công",
                    message: "Đăng nhập thành công"
                });
            }
        });
    };

    return (
        <PublicLayout>
            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                <section className="rounded-3xl border border-[#d9e1ef] bg-white p-6 shadow-[0_14px_40px_rgba(34,61,102,0.09)] md:p-10">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5f6368]">Đăng nhập</p>
                    <h1 className="mt-3 text-4xl font-semibold text-[#202124] md:text-5xl">Truy cập GMS Cloud</h1>
                    <p className="mt-4 text-sm leading-6 text-[#5f6368]">
                        Dùng một tài khoản để quản lý file, folder, URL và API trong cùng một workspace.
                    </p>

                    <div className="mt-8 space-y-3 rounded-2xl border border-[#e5eaf4] bg-[#f8fbff] p-5">
                        <p className="text-sm font-semibold text-[#202124]">Nổi bật</p>
                        <ul className="space-y-2 text-sm text-[#5f6368]">
                            <li>• Giao diện nhất quán với dashboard bên trong.</li>
                            <li>• Màu nhấn xanh, card sáng, viền mảnh kiểu Google Drive.</li>
                            <li>• Điều hướng rõ ràng tới đăng ký nếu chưa có tài khoản.</li>
                        </ul>
                    </div>
                </section>

                <section className="rounded-3xl border border-[#d9e1ef] bg-white p-6 shadow-[0_14px_40px_rgba(34,61,102,0.09)] md:p-10">
                    <form className="flex h-full flex-col gap-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="text-sm font-semibold text-[#202124]" htmlFor="email">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@company.com"
                                className={inputClasses}
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-[#202124]" htmlFor="password">
                                Mật khẩu
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Nhập mật khẩu"
                                className={inputClasses}
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm text-[#5f6368]">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" className="h-4 w-4 accent-[#1a73e8]" /> Ghi nhớ tôi
                            </label>
                            <a className="font-semibold text-[#1a73e8] hover:underline" href="#">
                                Quên mật khẩu?
                            </a>
                        </div>

                        <button
                            type="submit"
                            className="mt-2 rounded-full bg-[#1a73e8] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#175fc0]"
                        >
                            Đăng nhập
                        </button>

                        <p className="text-center text-sm text-[#5f6368]">
                            Chưa có tài khoản?{' '}
                            <Link className="font-semibold text-[#1a73e8] hover:underline" to="/auth/register">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </form>
                </section>
            </div>
        </PublicLayout>
    );
};

export default LoginPage;