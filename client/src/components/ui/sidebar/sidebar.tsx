import { NavLink } from "react-router";

const links = [
    { to: "/page/files", label: "Quản lý file", description: "Kho tài liệu cá nhân" },
    { to: "/page/urls", label: "Quản lý URL", description: "Theo dõi đường dẫn rút gọn" },
    { to: "/page/plan", label: "Plan", description: "Theo dõi gói hiện tại" },
];

const Sidebar = () => {
    return (
        <aside className="sticky top-4 rounded-3xl border border-[#d9e1ef] bg-white p-5 shadow-[0_12px_34px_rgba(34,61,102,0.08)]">
            <div className="space-y-2 border-b border-[#e5eaf4] pb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5f6368]">Drive</p>
                <p className="text-2xl font-semibold text-[#202124]">GMS Cloud</p>
                <p className="text-xs text-[#5f6368]">Tất cả thư mục, tệp và đường dẫn của bạn ở một nơi.</p>
            </div>

            <nav className="mt-5 space-y-1.5">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => `flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                            isActive
                                ? "border-[#cfe0fc] bg-[#e8f0fe] text-[#1a73e8]"
                                : "border-transparent text-[#202124] hover:border-[#e1e7f2] hover:bg-[#f8f9fa]"
                        }`}
                    >
                        <div>
                            <p className="font-semibold">{link.label}</p>
                            <p className="text-xs text-[#5f6368]">{link.description}</p>
                        </div>
                        <span className="text-xs font-semibold">›</span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-6 rounded-2xl border border-[#e5eaf4] bg-[#f8fbff] px-5 py-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[#5f6368]">
                    <span>Dung lượng</span>
                    <span>73%</span>
                </div>
                <p className="mt-1 text-xs text-[#5f6368]">Đã sử dụng 146 GB / 200 GB</p>
                <div className="mt-4 h-1.5 rounded-full bg-[#dbe3f2]">
                    <div className="h-full rounded-full bg-[#1a73e8]" style={{ width: "73%" }}></div>
                </div>
                <NavLink
                    to="/page/plan"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-[#d9e1ef] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#1a73e8] transition hover:bg-[#f8f9fa]"
                >
                    Nâng cấp
                </NavLink>
            </div>
        </aside>
    );
};

export default Sidebar;
