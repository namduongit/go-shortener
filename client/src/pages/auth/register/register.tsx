import { createElement, type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import type { RegisterResponse, RegisterForm } from "../../../services/types/auth.type";

import PublicLayout from "../../../components/layout/public-layout";
import Button from "../../../components/ui/button/button";
import { AuthModule } from "../../../services/modules/auth.module";
import { useExecute } from "../../../common/hooks/useExecute";
import { useNotificate } from "../../../common/hooks/useNotificate";

const inputClasses =
	"mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/15";


const RegisterPage = () => {
	const { Register } = AuthModule;
	const { execute, loading } = useExecute<RegisterResponse>();
	const notificate = useNotificate();
	const navigate = useNavigate();

	const [form, setForm] = useState<RegisterForm>({ email: "", password: "", password_confirm: "" });

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

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!form.email || !form.password || !form.password_confirm) {
			notificate.showToast({
				type: "warning",
				title: "Thông tin chưa đầy đủ",
				message: "Vui lòng điền đầy đủ thông tin đăng ký."
			});
			return;
		}

		execute(() => Register(form), {
			onError: () => {
				if (form.password !== form.password_confirm) {
					notificate.showToast({
						type: "error",
						title: "Lỗi đăng ký",
						message: "Mật khẩu và xác nhận mật khẩu không khớp."
					});

					return;
				}

				notificate.showToast({
					type: "error",
					title: "Đăng ký thất bại",
					message: "Vui lòng kiểm tra lại thông tin đăng ký."
				});
			},
			onSuccess: async () => {
				// notificate.showToast({
				// 	type: "success",
				// 	title: "Thành công",
				// 	message: "Đăng ký thành công, bạn có thể đăng nhập ngay bây giờ."
				// });
				await notificate.showAlert({
					title: "Đăng ký thành công",
					message: "Để kích hoạt tài khoản, vui lòng kiểm tra email và xác nhận liên kết được gửi đến hộp thư của bạn. Sau khi kích hoạt, bạn có thể đăng nhập và bắt đầu sử dụng dịch vụ.",
				});

				console.log("Alert dismissed, navigating to login...");

				new Promise(() => setTimeout(() => navigate("/auth/login"), 300));
			}
		});
	};

	return (
		<PublicLayout>
			<div className="grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
				<section className="bottom-to-top rounded-lg border border-[#d6e4fb] bg-linear-to-b from-[#f8fbff] to-white p-6 md:p-8">
					<p className="text-sm font-semibold text-[#1a73e8]">Tạo tài khoản</p>
					<h1 className="mt-2 text-3xl font-semibold text-gray-900 md:text-4xl">Bắt đầu với GMS Cloud</h1>
					<p className="mt-4 text-sm leading-6 text-gray-500">
						Tạo tài khoản để dùng chung hệ thống quản lý file, URL, API và hồ sơ trong cùng một không gian.
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

				<section className="top-to-bottom flex items-center rounded-lg border border-gray-300/90 bg-white p-6 md:p-8">
					<form className="mx-auto w-full max-w-md space-y-5" onSubmit={handleSubmit}>
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
								placeholder="Tối thiểu 8 ký tự"
								className={inputClasses}
								value={form.password}
								onChange={handleChange}
							/>
						</div>

						<div>
							<label className="text-sm font-semibold text-gray-900" htmlFor="password_confirm">
								Xác nhận mật khẩu
							</label>
							<input
								id="password_confirm"
								name="password_confirm"
								type="password"
								placeholder="Nhập lại mật khẩu"
								className={inputClasses}
								value={form.password_confirm}
								onChange={handleChange}
							/>
						</div>

						<p className="text-xs leading-relaxed text-gray-500">
							Bằng cách tạo tài khoản, bạn đồng ý với điều khoản sử dụng và chính sách bảo mật của hệ thống.
						</p>

						<Button
							type="submit"
							className="w-full flex justify-center rounded-md bg-[#1a73e8] px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
							disabled={loading}
							loadingText="Đang tạo tài khoản..."
						>
							Tạo tài khoản
						</Button>

						<p className="text-center text-sm text-gray-500">
							Đã có tài khoản?{' '}
							<Link className="font-semibold text-[#1a73e8] hover:underline" to="/auth/login">
								Đăng nhập
							</Link>
						</p>
					</form>
				</section>
			</div>
		</PublicLayout>
	);
};

export default RegisterPage;
