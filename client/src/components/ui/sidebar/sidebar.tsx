import { NavLink } from "react-router";
import { usePlanUsage } from "../../../common/hooks/usePlanUsage";

const links = [
    { to: "/page/files", label: "Quản lý file", description: "Kho tài liệu cá nhân" },
    { to: "/page/urls", label: "Quản lý URL", description: "Theo dõi đường dẫn rút gọn" },
    { to: "/page/plans", label: "Plan", description: "Theo dõi gói hiện tại" },
];

const toGb = (value: number) => value / 1024 / 1024 / 1024;

const formatToGb = (value: number) => `${toGb(value).toFixed(2)} GB`;

const Sidebar = () => {
    const { myPlanUsage } = usePlanUsage();

    const usedStorage = myPlanUsage?.used_storage ?? 0;
    const totalStorage = myPlanUsage?.total_storage ?? 0;
    const usedPercent = totalStorage > 0 ? Math.min(100, Math.round((usedStorage / totalStorage) * 100)) : 0;

    return (
        <aside className="sticky top-4 rounded-2xl border border-gray-300/90 bg-white p-5">
            <div className="space-y-2 border-b border-gray-300/90 pb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Drive</p>
                <p className="text-2xl font-semibold text-gray-900">GMS Cloud</p>
                <p className="text-xs text-gray-500">Tất cả thư mục, tệp và đường dẫn của bạn ở một nơi.</p>
            </div>

            <nav className="mt-5 space-y-1.5">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => `flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                            isActive
                                ? "border-[#cfe0fc] bg-[#e8f0fe] text-blue-500"
                                : "border-transparent text-gray-900 hover:border-[#e1e7f2] hover:bg-gray-50"
                        }`}
                    >
                        <div>
                            <p className="font-semibold">{link.label}</p>
                            <p className="text-xs text-gray-500">{link.description}</p>
                        </div>
                        <span className="text-xs font-semibold">›</span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-6 rounded-2xl border border-gray-300/90 bg-[#f8fbff] px-5 py-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-gray-500">
                    <span>Dung lượng</span>
                    <span>{usedPercent}%</span>
                </div>
                <p className="mt-1 text-xs font-semibold text-gray-900">Gói: {myPlanUsage?.plan.name ?? "Đang tải..."}</p>
                <p className="mt-1 text-xs text-gray-500">Đã sử dụng {formatToGb(usedStorage)} / {formatToGb(totalStorage)}</p>
                <div className="mt-4 h-1.5 rounded-full bg-[#dbe3f2]">
                    <div className="h-full rounded-full bg-[#1a73e8]" style={{ width: `${usedPercent}%` }}></div>
                </div>
                <NavLink
                    to="/page/plans"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-gray-300/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-blue-500 transition hover:bg-gray-50"
                >
                    Nâng cấp
                </NavLink>
            </div>
        </aside>
    );
};

export default Sidebar;
