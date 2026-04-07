interface UrlSearchToolbarProps {
    searchInput: string;
    onSearchInputChange: (value: string) => void;
    onSearch: () => void;
    onReload: () => Promise<void>;
}

const UrlSearchToolbar = ({ searchInput, onSearchInputChange, onSearch, onReload }: UrlSearchToolbarProps) => {
    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-300/90 bg-white px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full items-center gap-2 md:max-w-xl">
                <div className="flex h-10 w-full items-center gap-2 rounded-xl border border-gray-300/90 bg-[#fbfcff] px-3">
                    <i className="fa-solid fa-magnifying-glass text-xs text-[#5f6368]"></i>
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(event) => onSearchInputChange(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                onSearch();
                            }
                        }}
                        placeholder="Tìm theo mã, id, URL"
                        className="w-full bg-transparent text-sm text-[#202124] outline-none placeholder:text-[#8b939e]"
                    />
                </div>
                <button
                    className="rounded-xl border border-gray-300/90 bg-white px-3 py-2 text-sm font-semibold text-[#202124] transition hover:bg-[#f4f7fc]"
                    onClick={onSearch}
                >
                    Tìm
                </button>
            </div>

            <button
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300/90 bg-white px-3 py-2 text-sm font-semibold text-[#202124] transition hover:bg-[#f4f7fc]"
                onClick={() => void onReload()}
            >
                <i className="fa-solid fa-rotate-right text-xs"></i>
                Reload
            </button>
        </div>
    );
};

export default UrlSearchToolbar;
