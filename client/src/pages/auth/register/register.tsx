import { type ChangeEvent, type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import type { RegisterResponse, RegisterForm } from "../../../services/types/auth.type";

import PublicLayout from "../../../components/layout/public-layout";
import { AuthModule } from "../../../services/modules/auth.module";
import { useExecute } from "../../../common/hooks/useExecute";
import { useNotificate } from "../../../common/hooks/useNotificate";

const inputClasses =
	"mt-2 w-full rounded-xl border border-[#d9e1ef] bg-white px-4 py-3 text-sm text-[#202124] placeholder:text-[#80868b] transition focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/15";


const RegisterPage = () => {
	const { Register } = AuthModule;
	const { execute } = useExecute<RegisterResponse>();
	const notificate = useNotificate();
	const navigate = useNavigate();

	const [form, setForm] = useState<RegisterForm>({ email: "", password: "", confirmPassword: "" });

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!form.email || !form.password || !form.confirmPassword) {
			return;
		}

		execute(() => Register(form), {
			onError: () => {
				notificate.showToast({
					type: "error",
					title: "Đăng ký thất bại",
					message: "Vui lòng kiểm tra lại thông tin đăng ký."
				});
			},
			onSuccess: () => {
				notificate.showToast({
					type: "success",
					title: "Thành công",
					message: "Đăng ký thành công, bạn có thể đăng nhập ngay bây giờ."
				});
				new Promise(() => setTimeout(() => navigate("/auth/login"), 300));
			}
		});
	};

	return (
		<PublicLayout>
			<div className="grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
				<section className="rounded-3xl border border-[#d9e1ef] bg-white p-6 shadow-[0_14px_40px_rgba(34,61,102,0.09)] md:p-10">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5f6368]">Tạo tài khoản</p>
					<h1 className="mt-3 text-4xl font-semibold text-[#202124] md:text-5xl">Bắt đầu với GMS Cloud</h1>
					<p className="mt-4 text-sm leading-6 text-[#5f6368]">
						Tạo tài khoản để dùng chung hệ thống quản lý file, URL, API và hồ sơ trong cùng một không gian.
					</p>

					<div className="mt-8 space-y-3 rounded-2xl border border-[#e5eaf4] bg-[#f8fbff] p-5">
						<p className="text-sm font-semibold text-[#202124]">Điểm chính</p>
						<ul className="space-y-2 text-sm text-[#5f6368]">
							<li>• Kiểu giao diện đồng bộ với dashboard bên trong.</li>
							<li>• Tập trung vào file, folder, breadcrumb và thao tác tài khoản.</li>
							<li>• Các bước tạo tài khoản ngắn, rõ và dễ tiếp cận.</li>
						</ul>
					</div>
				</section>

				<section className="rounded-3xl border border-[#d9e1ef] bg-white p-6 shadow-[0_14px_40px_rgba(34,61,102,0.09)] md:p-10">
					<form className="space-y-5" onSubmit={handleSubmit}>
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
								placeholder="Tối thiểu 8 ký tự"
								className={inputClasses}
								value={form.password}
								onChange={handleChange}
								required
							/>
						</div>

						<div>
							<label className="text-sm font-semibold text-[#202124]" htmlFor="confirmPassword">
								Xác nhận mật khẩu
							</label>
							<input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								placeholder="Nhập lại mật khẩu"
								className={inputClasses}
								value={form.confirmPassword}
								onChange={handleChange}
								required
							/>
						</div>

						<p className="text-xs leading-relaxed text-[#5f6368]">
							Bằng cách tạo tài khoản, bạn đồng ý với điều khoản sử dụng và chính sách bảo mật của hệ thống.
						</p>

						<button
							type="submit"
							className="w-full rounded-full bg-[#1a73e8] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#175fc0]"
						>
							Tạo tài khoản
						</button>

						<p className="text-center text-sm text-[#5f6368]">
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
