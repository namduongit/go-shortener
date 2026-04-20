import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuthenticate } from "../../../common/hooks/useAuthenticate";
import Button from "../button/button";

type SearchSuggestion = {
    lable: string;
    description: string;
    icon: React.ReactNode; 
    directURL: string;

}

const searchSuggestions: SearchSuggestion[] = [
    {
        lable: "Trang chủ",
        description: "Đi đến trang chủ của GMS Cloud",
        icon: <i className="fa-solid fa-house"></i>,
        directURL: "/"
    },
    {
        lable: "Tệp của tôi",
        description: "Đi đến trang quản lý tệp của bạn",
        icon: <i className="fa-solid fa-file"></i>,
        directURL: "/page/files"
    },
    {
        lable: "API Keys",
        description: "Đi đến trang quản lý API Keys",
        icon: <i className="fa-solid fa-key"></i>,
        directURL: "/page/account/api"
    },
    {
        lable: "Thông tin tài khoản",
        description: "Đi đến trang thông tin tài khoản của bạn",
        icon: <i className="fa-solid fa-user"></i>,
        directURL: "/page/account/info"
    },
    {
        lable: "Link rút gọn của tôi",
        description: "Đi đến trang quản lý link rút gọn của bạn",
        icon: <i className="fa-solid fa-link"></i>,
        directURL: "/page/urls"
    },
    {
        lable: "Document API",
        description: "Đi đến trang tài liệu API của GMS Cloud",
        icon: <i className="fa-solid fa-book"></i>,
        directURL: "/page/documentation"
    },
    {
        lable: "Hỗ trợ",
        description: "Đi đến trang hỗ trợ của GMS Cloud",
        icon: <i className="fa-solid fa-headset"></i>,
        directURL: "/page/support"
    },
    {
        lable: "Quản lý gói dịch vụ",
        description: "Đi đến trang quản lý gói dịch vụ của bạn",
        icon: <i className="fa-solid fa-box"></i>,
        directURL: "/page/account/plan"
    }
]

const Header = () => {
    const navigate = useNavigate();
    const { state, clearState } = useAuthenticate();
    const [open, setOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);

    const handleNavigate = (path: string) => {
        setOpen(false);
        if (path === "/auth/logout") {
            clearState();
            window.location.href = "/auth/login";
            return;
        }
        navigate(path);
    };

    useEffect(() => {
        console.log("Search term:", searchTerm);
        if (searchTerm.trim() === "") {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const filtered = searchSuggestions.filter(suggestion =>
            suggestion.lable.toLowerCase().includes(searchTerm.toLowerCase()) ||
            suggestion.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setSuggestions(filtered);
        setShowSuggestions(true);
    }, [searchTerm]);

    return (
        <header className="flex flex-col gap-3 rounded-2xl border border-gray-300/90 bg-white px-4 py-3 md:flex-row md:items-center md:justify-between md:px-5">
            <div className="flex items-center gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#1a73e8] text-base font-black text-white shadow">
                    GMS
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Workspace</p>
                    <p className="text-lg font-semibold text-gray-900">GMS Cloud</p>
                </div>
            </div>

            <div className="flex w-full items-center gap-3 md:w-auto">
                <div className="relative flex h-11 w-full items-center gap-2 rounded-xl border border-gray-300/90 bg-white px-4 text-sm text-gray-500 md:w-96">
                    <span aria-hidden="true" className="text-base">
                        <i className="fa-solid fa-magnifying-glass"></i>
                    </span>
                    <input
                        type="text"
                        placeholder="Tìm trong GMS Cloud"
                        className="w-full border-none bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full mt-1 w-full left-0 rounded-xl border border-gray-300/90 bg-white shadow z-10">
                            {suggestions.map((suggestion) => (
                                <div
                                    key={suggestion.directURL}
                                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleNavigate(suggestion.directURL)}
                                >
                                    <span className="text-base text-gray-500">{suggestion.icon}</span>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{suggestion.lable}</p>
                                        <p className="text-xs text-gray-500">{suggestion.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="relative shrink-0">
                    <Button
                        className="rounded-xl flex flex-row items-center justify-center gap-3 border border-gray-300/90 bg-white px-3 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                        onClick={() => setOpen((prev) => !prev)}
                    >
                        <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#1a73e8] text-white">
                            <i className="fa-solid fa-user"></i>
                        </span>
                        <span className="hidden sm:block">
                            {state?.email || "User"}
                        </span>
                    </Button>
                    {open && (
                        <div className="absolute right-0 mt-3 w-52 overflow-hidden rounded-xl border border-gray-300/90 bg-white shadow-sm z-10">
                            {[
                                { label: "Thông tin", path: "/page/account/info" },
                                { label: "Đấu API", path: "/page/account/api" },
                                { label: "Đăng xuất", path: "/auth/logout" },
                            ].map((item) => (
                                <Button
                                    key={item.path}
                                    className="w-full px-4 py-2.5 text-left text-sm text-gray-900 transition hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleNavigate(item.path)}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;