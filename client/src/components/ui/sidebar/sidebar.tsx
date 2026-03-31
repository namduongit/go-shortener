import { NavLink } from "react-router";

const links = [
    { to: "/page/urls", label: "Sort URL", description: "Quản lý đường ngắn" },
    { to: "/page/files", label: "Manage file", description: "Kho tài liệu cá nhân" },
    { to: "/page/plan", label: "Plan & Upgrade", description: "Theo dõi gói hiện tại" },
];

const Sidebar = () => {
    return (
        <aside className="rounded-3xl border border-[#d7d1c6] bg-[#fbfaf7] p-6 shadow-[0_14px_45px_rgba(20,18,13,0.07)]">
            <div className="space-y-2 border-b border-[#dcd6cc] pb-5">
                <p className="text-[11px] uppercase tracking-[0.45em] text-[#6e675d]">Workspace</p>
                <p className="text-2xl font-serif text-[#1f241f]">Drive Hub</p>
                <p className="text-xs text-[#4b483f]">Bảng điều phối link & tài liệu với tinh thần cổ điển.</p>
            </div>

            <nav className="mt-6 space-y-2">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => `flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                            isActive
                                ? "border-[#2f3a30] bg-[#e8e3d8] text-[#1f241f]"
                                : "border-transparent text-[#3b372f] hover:border-[#cfc7b8] hover:bg-[#f6f3ea]"
                        }`}
                    >
                        <div>
                            <p className="font-semibold">{link.label}</p>
                            <p className="text-xs text-[#6a665d]">{link.description}</p>
                        </div>
                        <span className="text-xs font-semibold text-[#2f3a30]">↗</span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-8 rounded-2xl border border-[#dcd6cc] bg-[#f6f3ea] px-5 py-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-[#6e675d]">
                    <span>Dung lượng</span>
                    <span>73%</span>
                </div>
                <p className="mt-1 text-xs text-[#4b483f]">Đã sử dụng 146 GB / 200 GB</p>
                <div className="mt-4 h-1.5 rounded-full bg-[#e1dbd0]">
                    <div className="h-full rounded-full bg-[#2f3a30]" style={{ width: "73%" }}></div>
                </div>
                <NavLink
                    to="/page/plan"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-[#2f3a30] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f3a30] transition hover:bg-[#2f3a30] hover:text-[#fefcf7]"
                >
                    Nâng cấp
                </NavLink>
            </div>
        </aside>
    );
};

export default Sidebar;
