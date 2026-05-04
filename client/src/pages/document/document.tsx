import { Link } from "react-router";

const endpoints = [
    {
        group: "Authentication",
        items: [
            { method: "POST", path: "/auth/register", description: "Đăng ký tài khoản mới", auth: false },
            { method: "POST", path: "/auth/login", description: "Đăng nhập và nhận cookie phiên", auth: false },
            { method: "POST", path: "/auth/logout", description: "Đăng xuất, xóa cookie", auth: true },
            { method: "GET", path: "/auth/activation", description: "Kích hoạt tài khoản qua email link", auth: false },
            { method: "POST", path: "/auth/resend-activation-email", description: "Gửi lại email kích hoạt", auth: false },
            { method: "GET", path: "/api/guard/auth-config", description: "Lấy trạng thái phiên & thông tin usage", auth: true },
            { method: "POST", path: "/api/guard/change-password", description: "Đổi mật khẩu (vô hiệu token cũ)", auth: true },
        ],
    },
    {
        group: "Folder",
        items: [
            { method: "GET", path: "/api/guard/folders", description: "Lấy danh sách tất cả folder", auth: true },
            { method: "POST", path: "/api/guard/folders", description: "Tạo folder mới", auth: true },
            { method: "GET", path: "/api/guard/folders/:uuid", description: "Chi tiết folder và danh sách file bên trong", auth: true },
            { method: "DELETE", path: "/api/guard/folders/:uuid", description: "Xóa folder và toàn bộ file liên quan", auth: true },
            { method: "PATCH", path: "/api/guard/folders/:uuid", description: "Đổi tên folder", auth: true },
        ],
    },
    {
        group: "File",
        items: [
            { method: "GET", path: "/api/guard/files", description: "Lấy danh sách tất cả file", auth: true },
            { method: "DELETE", path: "/api/guard/files/:uuid", description: "Xóa file và hoàn trả quota", auth: true },
            { method: "POST", path: "/api/guard/files/:uuid/share", description: "Bật chia sẻ công khai file", auth: true },
            { method: "POST", path: "/api/guard/files/:uuid/unshare", description: "Tắt chia sẻ công khai file", auth: true },
        ],
    },
    {
        group: "Upload",
        items: [
            { method: "POST", path: "/api/guard/presign-upload", description: "Khởi tạo session upload & nhận presigned URL", auth: true },
            { method: "POST", path: "/api/guard/sign-upload/:uuid", description: "Lấy URL ký để upload part", auth: true },
            { method: "POST", path: "/api/guard/complete-single-upload/:uuid", description: "Hoàn thành upload đơn", auth: true },
            { method: "POST", path: "/api/guard/complete-multipart-upload/:uuid", description: "Hoàn thành upload nhiều part", auth: true },
        ],
    },
    {
        group: "Short URL",
        items: [
            { method: "GET", path: "/api/guard/short-urls", description: "Danh sách URL rút gọn", auth: true },
            { method: "POST", path: "/api/guard/short-urls", description: "Tạo URL rút gọn mới", auth: true },
            { method: "DELETE", path: "/api/guard/short-urls/:uuid", description: "Xóa URL rút gọn", auth: true },
            { method: "GET", path: "/:code", description: "Redirect theo short code", auth: false },
        ],
    },
    {
        group: "Public",
        items: [
            { method: "GET", path: "/api/public/plans", description: "Danh sách gói dịch vụ", auth: false },
            { method: "GET", path: "/api/public/images/:code", description: "Xem ảnh công khai theo code", auth: false },
        ],
    },
];

const methodColor: Record<string, string> = {
    GET: "bg-blue-50 text-blue-700 border-blue-200",
    POST: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PUT: "bg-amber-50 text-amber-700 border-amber-200",
    PATCH: "bg-violet-50 text-violet-700 border-violet-200",
    DELETE: "bg-red-50 text-red-700 border-red-200",
};


const DocumentPage = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top nav */}
            <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="grid h-8 w-8 place-items-center rounded-md bg-[#1a73e8] text-xs font-black text-white">
                            GMS
                        </div>
                        <span className="text-sm font-semibold text-gray-900">API Documentation</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/auth/login"
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Đăng nhập
                        </Link>
                        <Link
                            to="/auth/register"
                            className="rounded-md bg-[#1a73e8] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                        >
                            Bắt đầu
                        </Link>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-5xl px-6 py-10">
                <div className="mb-10">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#1a73e8]">GMS Cloud</p>
                    <h1 className="mt-2 text-3xl font-semibold text-gray-900">API Reference</h1>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
                        Tài liệu tham khảo đầy đủ cho GMS Cloud REST API. Tất cả endpoint được phân nhóm theo tính năng
                        và yêu cầu xác thực cookie phiên (HttpOnly).
                    </p>

                    <div className="mt-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        <i className="fa-solid fa-circle-info mt-0.5 shrink-0 text-amber-500"></i>
                        <p>
                            Các endpoint có nhãn <strong>Auth</strong> yêu cầu cookie <code className="rounded bg-amber-100 px-1 font-mono text-xs">accessToken</code> hợp lệ.
                            Cookie được set tự động sau khi đăng nhập thành công.
                        </p>
                    </div>
                </div>

                <div className="space-y-8">
                    {endpoints.map((group) => (
                        <section key={group.group}>
                            <div className="mb-3 flex items-center gap-3">
                                <h2 className="text-base font-semibold text-gray-900">{group.group}</h2>
                                <span className="text-xs text-gray-400">{group.items.length} endpoint{group.items.length > 1 ? "s" : ""}</span>
                            </div>

                            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50 text-left">
                                            <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Method</th>
                                            <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Path</th>
                                            <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Mô tả</th>
                                            <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Auth</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {group.items.map((item) => (
                                            <tr key={`${item.method}-${item.path}`} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex rounded border px-2 py-0.5 font-mono text-xs font-semibold ${methodColor[item.method] ?? "bg-gray-100 text-gray-600"}`}>
                                                        {item.method}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <code className="font-mono text-xs text-gray-700">{item.path}</code>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">{item.description}</td>
                                                <td className="px-4 py-3">
                                                    {item.auth ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-200">
                                                            <i className="fa-solid fa-lock text-[10px]"></i>
                                                            Bắt buộc
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                                                            <i className="fa-solid fa-unlock text-[10px]"></i>
                                                            Công khai
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    ))}
                </div>

                <div className="mt-10 rounded-lg border border-gray-200 bg-white p-5">
                    <h3 className="text-sm font-semibold text-gray-900">Base URL</h3>
                    <code className="mt-2 block font-mono text-sm text-gray-600">https://api.gms-cloud.namduong.dev</code>
                    <p className="mt-2 text-xs text-gray-500">Tất cả request cần gửi kèm <code className="rounded bg-gray-100 px-1 font-mono">credentials: "include"</code> để cookie hoạt động đúng.</p>
                </div>

                <footer className="mt-10 border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
                    GMS Cloud API Documentation · Liên hệ{" "}
                    <a href="mailto:nguyennamduong205@gmail.com" className="text-[#1a73e8] hover:underline">
                        nguyennamduong205@gmail.com
                    </a>
                </footer>
            </div>
        </div>
    );
};

export default DocumentPage;
