import Button from "../button/button";

interface UrlSearchToolbarProps {
    searchInput: string;
    onSearchInputChange: (value: string) => void;
    onSearch: () => void;
    onReload: () => Promise<void>;
}

const UrlSearchToolbar = ({ searchInput, onSearchInputChange, onSearch, onReload }: UrlSearchToolbarProps) => {
    return (
        <div className="flex flex-col gap-3 px-1 py-2 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full items-center gap-2 md:max-w-xl">
                <div className="flex h-10 w-full items-center gap-2 rounded-md border border-gray-300 bg-white px-3">
                    <i className="fa-solid fa-magnifying-glass text-xs text-gray-500"></i>
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
                        className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                    />
                </div>
                <Button
                    type="button"
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                    onClick={onSearch}
                >
                    Tìm
                </Button>
            </div>

            <Button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                onClick={() => void onReload()}
            >
                Làm mới
            </Button>
        </div>
    );
};

export default UrlSearchToolbar;
