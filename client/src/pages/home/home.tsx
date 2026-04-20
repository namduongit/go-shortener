import { createElement, useEffect } from "react";
import { Link } from "react-router";
import PublicLayout from "../../components/layout/public-layout";

const highlights = [
    {
        title: "Quản lý file và folder",
        description: "Lưu file ở root hoặc trong thư mục, điều hướng bằng breadcrumb giống Google Drive.",
    },
    {
        title: "Quản lý URL",
        description: "Tạo, theo dõi và thao tác liên kết rút gọn trong một workspace thống nhất.",
    },
    {
        title: "API & tài khoản",
        description: "Đấu nối API, xem thông tin hồ sơ và quản lý phiên đăng nhập trong cùng hệ thống.",
    },
];

const HomePage = () => {
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

    return (
        <PublicLayout>
            <section className="space-y-6">
                <div className="grid items-center gap-5 rounded-xl border border-[#d6e4fb] bg-linear-to-b from-[#f8fbff] to-white p-5 md:grid-cols-[1.2fr_0.8fr] md:p-8">
                    <div>
                        <p className="text-sm font-semibold text-[#1a73e8]">GMS Cloud</p>
                        <h1 className="bottom-to-top mt-2 text-3xl font-semibold leading-tight text-gray-900 md:text-5xl">
                            Nơi mọi file và URL của bạn được sắp xếp rõ ràng.
                        </h1>
                        <p className="bottom-to-top mt-4 max-w-2xl text-sm leading-6 text-gray-500 md:text-base">
                            Lưu trữ file, chia sẻ ảnh bằng link public, theo dõi plan và quản lý API token trong cùng một dashboard.
                        </p>

                        <div className="left-to-right mt-6 flex flex-col gap-3 sm:flex-row">
                            <Link
                                to="/auth/register"
                                className="inline-flex items-center justify-center rounded-md bg-[#1a73e8] px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                                <i className="fa-solid fa-rocket mr-2"></i>
                                Dùng thử ngay
                            </Link>
                            <Link
                                to="/auth/login"
                                className="inline-flex items-center justify-center rounded-md border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                            >
                                <i className="fa-solid fa-right-to-bracket mr-2"></i>
                                Đăng nhập
                            </Link>
                        </div>
                    </div>

                    <div className="top-to-bottom flex justify-center">
                        {createElement("dotlottie-wc", {
                            src: "https://lottie.host/a76e30db-976c-45e7-9bed-efe7c84c8317/GKUs9NOScO.lottie",
                            style: { width: "280px", height: "280px" },
                            autoplay: true,
                            loop: true,
                        })}
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    {highlights.map((item, idx) => (
                        <article key={item.title} className="bottom-to-top rounded-lg border border-gray-300/90 bg-white p-4"
                            style={{ animationDelay: `${idx * 0.15}s` }}
                        >
                            <p className="text-base font-semibold text-gray-900">{item.title}</p>
                            <p className="mt-2 text-sm leading-6 text-gray-500">{item.description}</p>
                        </article>
                    ))}
                </div>

                <div className="grid gap-4 rounded-xl border border-gray-300/90 bg-white p-5 md:grid-cols-[1.05fr_0.95fr] md:p-6 overflow-hidden">
                    <div className="left-to-right">
                        <h2 className="text-xl font-semibold text-gray-900">Dịch vụ & tài liệu</h2>
                        <p className="mt-2 text-sm text-gray-500">Truy cập nhanh các khu vực chính và tài liệu tích hợp.</p>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <Link to="/page/file" className="rounded-md border border-gray-300/90 bg-white px-3 py-3 text-sm font-medium text-gray-800 hover:border-[#c9dafc] hover:bg-[#f8fbff]">
                                <span className="block text-xs text-gray-500">Storage</span>
                                <i className="fa-regular fa-folder-open mr-2 text-[#1a73e8]"></i>
                                Quản lý file & folder
                            </Link>
                            <Link to="/page/url" className="rounded-md border border-gray-300/90 bg-white px-3 py-3 text-sm font-medium text-gray-800 hover:border-[#c9dafc] hover:bg-[#f8fbff]">
                                <span className="block text-xs text-gray-500">Short Link</span>
                                <i className="fa-solid fa-link mr-2 text-[#1a73e8]"></i>
                                Quản lý URL
                            </Link>
                            <Link to="/page/account/info" className="rounded-md border border-gray-300/90 bg-white px-3 py-3 text-sm font-medium text-gray-800 hover:border-[#c9dafc] hover:bg-[#f8fbff]">
                                <span className="block text-xs text-gray-500">Account</span>
                                <i className="fa-regular fa-user mr-2 text-[#1a73e8]"></i>
                                Hồ sơ tài khoản
                            </Link>
                            <Link to="/page/account/api" className="rounded-md border border-gray-300/90 bg-white px-3 py-3 text-sm font-medium text-gray-800 hover:border-[#c9dafc] hover:bg-[#f8fbff]">
                                <span className="block text-xs text-gray-500">Developer</span>
                                <i className="fa-solid fa-code mr-2 text-[#1a73e8]"></i>
                                API Dashboard
                            </Link>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <a
                                href="/docs.md"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center rounded-md bg-[#1a73e8] px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                                <i className="fa-regular fa-file-lines mr-2"></i>
                                Docs
                            </a>
                            <Link
                                to="/page/account/api"
                                className="inline-flex items-center rounded-md border border-gray-300/90 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                            >
                                <i className="fa-solid fa-book-open mr-2 text-[#1a73e8]"></i>
                                API Reference
                            </Link>
                        </div>
                    </div>

                    <div className="top-to-bottom rounded-lg border border-[#d6e4fb] bg-linear-to-b from-[#f8fbff] to-white p-4">
                        <h3 className="text-base font-semibold text-gray-900">Liên hệ triển khai</h3>
                        <p className="mt-1 text-sm text-gray-500">Sẵn sàng hỗ trợ tích hợp, vận hành và tùy biến dịch vụ.</p>

                        <div className="mt-4 space-y-2">
                            <a href="mailto:nguyennamduong205@gmail.com" className="flex items-center justify-between rounded-md border border-gray-300/90 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <span><i className="fa-regular fa-envelope mr-2 text-[#1a73e8]"></i>Email</span>
                                <span className="font-medium text-gray-900">nguyennamduong205@gmail.com</span>
                            </a>
                            <a href="tel:0388853835" className="flex items-center justify-between rounded-md border border-gray-300/90 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <span><i className="fa-solid fa-phone mr-2 text-[#1a73e8]"></i>SĐT</span>
                                <span className="font-medium text-gray-900">0388853835</span>
                            </a>
                            <a href="https://github.com/namduongit" target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-md border border-gray-300/90 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <span><i className="fa-brands fa-github mr-2 text-[#1a73e8]"></i>GitHub</span>
                                <span className="font-medium text-gray-900">namduongit</span>
                            </a>
                            <a href="https://facebook.com/namduongit" target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-md border border-gray-300/90 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <span><i className="fa-brands fa-facebook mr-2 text-[#1a73e8]"></i>Facebook</span>
                                <span className="font-medium text-gray-900">namduongit</span>
                            </a>
                        </div>
                    </div>
                </div>

                <footer className="border-t border-gray-300/90 pt-4 text-sm text-gray-500">
                    <p>GMS Cloud Service - File, URL, API và Account Management.</p>
                </footer>
            </section>
        </PublicLayout>
    );
};

export default HomePage;