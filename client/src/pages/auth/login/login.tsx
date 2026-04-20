import { createElement, type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { Link } from "react-router";
import type { LoginResponse, LoginForm } from "../../../services/types/auth.type";
import { useExecute } from "../../../common/hooks/useExecute";
import { AuthModule } from "../../../services/modules/auth.module";
import { useNotificate } from "../../../common/hooks/useNotificate";
import { useAuthenticate } from "../../../common/hooks/useAuthenticate";
import PublicLayout from "../../../components/layout/public-layout";
import Button from "../../../components/ui/button/button";

const inputClasses =
    "mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/15";

const LoginPage = () => {
    const { Login } = AuthModule;
    const { execute, loading } = useExecute<LoginResponse>();
    const notificate = useNotificate();
    const authenticate = useAuthenticate();

    const [form, setForm] = useState<LoginForm>({ email: "", password: "" });

    useEffect(() => {
        const existingScript = document.querySelector("script[data-dotlottie-player='true']");
        if (existingScript) {
            return;
        }

        const script = document.createElement("script");
        script.src = "https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.10/dist/dotlottie-wc.js";
        script.type = "module";
        script.setAttribute("data-dotlottie-player", "true");
        document.body.appendChild(script);
    }, []);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!form.email || !form.password) {
            return;
        }

        await execute(() => Login(form), {
            onError: (error) => {
                console.log("Login error: ", error);
                notificate.showToast({
                    type: "error",
                    title: "Đăng nhập thất bại",
                    message: "Vui lòng kiểm tra lại thông tin đăng nhập."
                });
            },
            onSuccess: (result) => {
                authenticate.saveState(result);
                notificate.showToast({
                    type: "success",
                    title: "Thành công",
                    message: "Đăng nhập thành công"
                });

                new Promise((resolve) => setTimeout(resolve, 1000)).then(() => {
                    window.location.reload();
                });
            }
        });
    };

    return (
        <PublicLayout>
            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                <section className="top-to-bottom rounded-lg border border-[#d6e4fb] bg-linear-to-b from-[#f8fbff] to-white p-6 md:p-8">
                    <p className="text-sm font-semibold text-[#1a73e8]">Đăng nhập</p>
                    <h1 className="mt-2 text-3xl font-semibold text-gray-900 md:text-4xl">Truy cập GMS Cloud</h1>
                    <p className="mt-4 text-sm leading-6 text-gray-500">
                        Dùng một tài khoản để quản lý file, folder, URL và API trong cùng một workspace.
                    </p>

                    <div className="mt-6 flex justify-center">
                        {createElement("dotlottie-wc", {
                            src: "https://lottie.host/8ddc56b3-da5b-44e3-b722-c15356930981/rDzwRhPzBZ.lottie",
                            style: { width: "260px", height: "260px" },
                            autoplay: true,
                            loop: true,
                        })}
                    </div>
                </section>

                <section className="bottom-to-top flex items-center rounded-lg border border-gray-300/90 bg-white p-6 md:p-8">
                    <form className="mx-auto flex w-full max-w-md flex-col gap-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="text-sm font-semibold text-gray-900" htmlFor="email">
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
                            <label className="text-sm font-semibold text-gray-900" htmlFor="password">
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

                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" className="h-4 w-4 accent-[#1a73e8]" /> Ghi nhớ tôi
                            </label>
                            <a className="font-semibold text-[#1a73e8] hover:underline" href="#">
                                Quên mật khẩu?
                            </a>
                        </div>

                        <Button
                            type="submit"
                            className="mt-2 flex justify-center rounded-md bg-[#1a73e8] px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                            loading={loading}
                            loadingText="Đang đăng nhập..."
                            disabled={!form.email || !form.password}
                        >
                            Đăng nhập
                        </Button>

                        <p className="text-center text-sm text-gray-500">
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