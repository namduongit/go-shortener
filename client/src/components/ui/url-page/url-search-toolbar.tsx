import Button from "../button/button";

interface UrlSearchToolbarProps {
    searchInput: string;
    onSearchInputChange: (value: string) => void;
    onSearch: () => void;
    onReload: () => Promise<void>;
}

const UrlSearchToolbar = ({ searchInput, onSearchInputChange, onSearch, onReload }: UrlSearchToolbarProps) => {
    return (
        <div className="flex items-center gap-2 py-2">
            <div className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 focus-within:border-[#1a73e8] transition-colors max-w-md">
                <i className="fa-solid fa-magnifying-glass text-xs text-gray-400" />
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => onSearchInputChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onSearch()}
                    placeholder="Tìm theo mã, URL…"
                    className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                />
            </div>

            <Button
                className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={onSearch}
            >
                Tìm
            </Button>

            <Button
                className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => void onReload()}
            >
                <i className="fa-solid fa-rotate text-xs" />
                <span className="hidden sm:inline">Làm mới</span>
            </Button>
        </div>
    );
};

export default UrlSearchToolbar;
