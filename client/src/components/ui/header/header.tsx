import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuthenticate } from "../../../common/hooks/useAuthenticate";

const Header = () => {
    const navigate = useNavigate();
    const { saveState } = useAuthenticate();
    const [open, setOpen] = useState(false);

    const handleNavigate = (path: string) => {
        setOpen(false);
        if (path === "/auth/logout") {
            localStorage.removeItem("GO_ACCOUNT");
            saveState({ email: "", plan: "", role: "" });
            window.location.href = "/auth/login";
            return;
        }
        navigate(path);
    };

    return (
        <header className="mb-6 flex items-center justify-between rounded-3xl border border-[#ded7c7] bg-white/95 px-6 py-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2d2a26] text-white">
                    GO
                    +                </div>
                <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-[#8b714c]">Workspace</p>
                    <p className="text-lg font-semibold text-[#1f1d19]">Drive Hub</p>
                </div>
            </div>

            <div className="relative">
                <button
                    className="flex items-center gap-3 rounded-2xl border border-[#dcd3c3] bg-[#f9f6ef] px-3 py-2 text-sm font-semibold text-[#2d2a26]"
                    onClick={() => setOpen((prev) => !prev)}
                >
                    <span className="h-8 w-8 rounded-full bg-[#2d2a26] text-white grid place-items-center">HM</span>
                    <span>Hoàng Minh</span>
                </button>
                {open && (
                    <div className="absolute right-0 mt-3 w-52 rounded-2xl border border-[#e4dbcc] bg-white shadow-lg">
                        {[
                            { label: "Thông tin", path: "/account/info" },
                            { label: "Đấu API", path: "/account/api" },
                            { label: "Đăng xuất", path: "/auth/logout" },
                        ].map((item) => (
                            <button
                                key={item.path}
                                className="w-full text-left px-4 py-3 text-sm text-[#2f3a30] hover:bg-[#f6f3ea]"
                                onClick={() => handleNavigate(item.path)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;