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
    return (
        <PublicLayout>
        <section className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="rounded-3xl border border-[#d9e1ef] bg-white p-6 shadow-[0_14px_40px_rgba(34,61,102,0.09)] md:p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5f6368]">GMS Cloud</p>
                <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-tight text-[#202124] md:text-6xl">
                    Không gian quản lý file, URL và API theo phong cách Google Drive.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-[#5f6368] md:text-base">
                    Một workspace duy nhất để lưu file vào folder hoặc root, quản lý đường dẫn ngắn, và
                    theo dõi tài khoản bằng giao diện sáng, sạch, quen thuộc.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                        to="/auth/register"
                        className="inline-flex items-center justify-center rounded-full bg-[#1a73e8] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#175fc0]"
                    >
                        Bắt đầu ngay
                    </Link>
                    <Link
                        to="/auth/login"
                        className="inline-flex items-center justify-center rounded-full border border-[#d9e1ef] px-6 py-3 text-sm font-semibold text-[#202124] transition hover:bg-[#f8f9fa]"
                    >
                        Đăng nhập
                    </Link>
                </div>

                <div className="mt-10 grid gap-3 md:grid-cols-3">
                    {highlights.map((item) => (
                        <article key={item.title} className="rounded-2xl border border-[#e5eaf4] bg-[#f8fbff] p-4">
                            <p className="text-sm font-semibold text-[#202124]">{item.title}</p>
                            <p className="mt-2 text-xs leading-5 text-[#5f6368]">{item.description}</p>
                        </article>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div className="rounded-3xl border border-[#d9e1ef] bg-white p-6 shadow-[0_14px_40px_rgba(34,61,102,0.09)] md:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5f6368]">Preview</p>
                    <h2 className="mt-3 text-2xl font-semibold text-[#202124]">Cấu trúc workspace</h2>
                    <div className="mt-5 space-y-3">
                        {[
                            ["Header", "Logo GMS, tìm kiếm và account action."],
                            ["Sidebar trái", "File, URL, Plan theo đúng thứ tự điều hướng."],
                            ["Nội dung phải", "Card trắng, viền mảnh, bóng nhẹ, dễ đọc."],
                        ].map(([label, description]) => (
                            <div key={label} className="rounded-2xl border border-[#e5eaf4] bg-[#fafbfd] px-4 py-3">
                                <p className="text-sm font-semibold text-[#202124]">{label}</p>
                                <p className="mt-1 text-xs text-[#5f6368]">{description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-3xl border border-[#d9e1ef] bg-[#1a73e8] p-6 text-white shadow-[0_14px_40px_rgba(34,61,102,0.12)] md:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Quick start</p>
                    <h2 className="mt-3 text-2xl font-semibold">Đăng nhập để vào dashboard</h2>
                    <p className="mt-2 text-sm leading-6 text-white/85">
                        Sau khi vào hệ thống, bạn có thể quản lý file trong folder, upfile vào root hoặc vào
                        thư mục cụ thể, và di chuyển qua breadcrumb.
                    </p>
                </div>
            </div>
        </section>
        </PublicLayout>
    );
};

export default HomePage;