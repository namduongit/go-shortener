import type { FileResponse } from "../../../services/types/file.type";
import { formatDate } from "../../../services/utils/date";
import { formatFileSize } from "../../../services/utils/file";
import Button from "../button/button";

type ExplorerItem =
    | {
        kind: "file";
        key: string;
        file: FileResponse;
    }
    | {
        kind: "folder";
        key: string;
        folderName: string;
    };

interface FileExplorerProps {
    currentFolder: string | null;
    tableViewportRows: number;
    rowMinHeight: number;
    paginatedItems: ExplorerItem[];
    selectedFile: FileResponse | null;
    resolveFileFolderName: (file: FileResponse) => string;
    onToggleFile: (file: FileResponse) => void;
    onOpenFolder: (folderName: string) => void;
    loading: boolean;
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    totalPages: number;
    onItemsPerPageChange: (size: number) => void;
    onPreviousPage: () => void;
    onNextPage: () => void;
}

const FileExplorer = ({
    currentFolder,
    tableViewportRows,
    rowMinHeight,
    paginatedItems,
    selectedFile,
    resolveFileFolderName,
    onToggleFile,
    onOpenFolder,
    loading,
    totalItems,
    itemsPerPage,
    currentPage,
    totalPages,
    onItemsPerPageChange,
    onPreviousPage,
    onNextPage,
}: FileExplorerProps) => {
    return (
        <div className="overflow-hidden rounded-2xl border border-gray-300/90 bg-white">
            <div className="flex items-center justify-between border-b border-[#eef2f7] bg-[#fafbfd] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#5f6368]">
                <span>Tệp và thư mục</span>
                <span>{currentFolder ?? "GMS Cloud"}</span>
            </div>

            <div
                className="divide-y divide-[#eef2f7] overflow-y-auto"
                style={{
                    height: `${tableViewportRows * rowMinHeight}px`,
                    maxHeight: `${tableViewportRows * rowMinHeight}px`,
                }}
            >
                {paginatedItems.map((item) => {
                    if (item.kind === "file") {
                        return (
                            <Button
                                key={item.key}
                                className={`flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-[#f8fbff] ${selectedFile?.uuid === item.file.uuid ? "bg-[#eef4ff]" : "bg-white"}`}
                                onClick={() => onToggleFile(item.file)}
                            >
                                <div className="min-w-0 flex items-center gap-3">
                                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e8f0fe] text-[#1a73e8]">
                                        <i className="fa-regular fa-file"></i>
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-[#202124]">{item.file.file_name}</p>
                                        <p className="truncate text-xs text-[#5f6368]">
                                            {item.file.file_type} · {formatFileSize(item.file.size)} · {formatDate(String(item.file.uploaded_at))}
                                        </p>
                                    </div>
                                </div>
                                <span className="ml-4 shrink-0 text-xs text-[#5f6368]">{resolveFileFolderName(item.file)}</span>
                            </Button>
                        );
                    }

                    return (
                        <Button
                            key={item.key}
                            className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-[#f8fbff]"
                            onClick={() => onOpenFolder(item.folderName)}
                        >
                            <div className="min-w-0 flex items-center gap-3">
                                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#fff6df] text-[#b26a00]">
                                    <i className="fa-solid fa-folder"></i>
                                </span>
                                <p className="truncate text-sm font-semibold text-[#202124]">{item.folderName}</p>
                            </div>

                            <div>
                                <span className="ml-4 shrink-0 text-xs font-semibold text-[#5f6368]">Mở</span>
                            </div>
                        </Button>
                    );
                })}

                {!loading && totalItems === 0 && (
                    <div className="px-4 py-10 text-center text-sm text-[#5f6368]">
                        Chưa có dữ liệu trong vị trí này.
                    </div>
                )}
            </div>

            {totalItems > 0 && (
                <div className="flex flex-col items-start justify-between gap-3 border-t border-[#eef2f7] bg-[#fafbfd] px-4 py-3 text-sm text-[#5f6368] md:flex-row md:items-center">
                    <div className="flex items-center gap-2">
                        <span>Hiển thị</span>
                        <select
                            value={itemsPerPage}
                            onChange={(event) => onItemsPerPageChange(Number(event.target.value))}
                            className="rounded-lg border border-gray-300/90 bg-white px-2 py-1 text-sm text-[#202124] outline-none"
                        >
                            {[5, 10].map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                        <span>/ trang</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            className="rounded-lg border border-gray-300/90 bg-white px-3 py-1 text-sm font-semibold text-[#202124] disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={onPreviousPage}
                            disabled={currentPage === 1}
                        >
                            Trước
                        </button>
                        <span className="text-sm text-[#5f6368]">
                            Trang {currentPage}/{totalPages}
                        </span>
                        <button
                            className="rounded-lg border border-gray-300/90 bg-white px-3 py-1 text-sm font-semibold text-[#202124] disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={onNextPage}
                            disabled={currentPage === totalPages}
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileExplorer;
