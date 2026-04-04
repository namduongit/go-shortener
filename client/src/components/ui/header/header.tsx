import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuthenticate } from "../../../common/hooks/useAuthenticate";
import Button from "../button/button";

const Header = () => {
    const navigate = useNavigate();
    const { state, saveState } = useAuthenticate();
    const [open, setOpen] = useState(false);

    const handleNavigate = (path: string) => {
        setOpen(false);
        if (path === "/auth/logout") {
            localStorage.removeItem("GO_ACCOUNT");
            saveState({ email: "", plan_name: "", role: "" });
            window.location.href = "/auth/login";
            return;
        }
        navigate(path);
    };

    return (
        <header className="flex flex-col gap-3 rounded-3xl border border-[#d9e1ef] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(34,61,102,0.08)] md:flex-row md:items-center md:justify-between md:px-5">
            <div className="flex items-center gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#1a73e8] text-base font-black text-white shadow-[0_8px_18px_rgba(26,115,232,0.24)]">
                    GMS
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5f6368]">Workspace</p>
                    <p className="text-lg font-semibold text-[#202124]">GMS Cloud</p>
                </div>
            </div>

            <div className="flex w-full items-center gap-3 md:w-auto">
                <div className="flex h-11 w-full items-center gap-2 rounded-full border border-[#dde3ef] bg-[#f8f9fa] px-4 text-sm text-[#5f6368] md:w-96">
                    <span aria-hidden="true" className="text-base">
                        ⌕
                    </span>
                    <input
                        type="text"
                        placeholder="Tìm trong Drive"
                        className="w-full border-none bg-transparent text-sm text-[#202124] outline-none placeholder:text-[#80868b]"
                    />
                </div>

                <div className="relative shrink-0">
                    <Button
                        variant="secondary"
                        className="gap-3 px-3 py-2"
                        onClick={() => setOpen((prev) => !prev)}
                    >
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#1a73e8] text-white">HM</span>
                        <span className="hidden sm:block">
                            {state.email || "User"}
                        </span>
                    </Button>
                    {open && (
                        <div className="absolute right-0 mt-3 w-52 overflow-hidden rounded-2xl border border-[#dde3ef] bg-white py-1 shadow-[0_10px_28px_rgba(32,33,36,0.18)]">
                            {[
                                { label: "Thông tin", path: "/page/account/info" },
                                { label: "Đấu API", path: "/page/account/api" },
                                { label: "Đăng xuất", path: "/auth/logout" },
                            ].map((item) => (
                                <button
                                    key={item.path}
                                    className="w-full px-4 py-2.5 text-left text-sm text-[#202124] transition hover:bg-[#f8f9fa]"
                                    onClick={() => handleNavigate(item.path)}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;