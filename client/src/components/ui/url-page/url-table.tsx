import type { UrlResponse } from "../../../services/types/url.type";
import { formatDate } from "../../../services/utils/date";

interface UrlTableProps {
    paginatedUrls: UrlResponse[];
    loading: boolean;
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    totalPages: number;
    onDelete: (uuid: string) => Promise<void>;
    onItemsPerPageChange: (size: number) => void;
    onPreviousPage: () => void;
    onNextPage: () => void;
}

const UrlTable = ({
    paginatedUrls,
    loading,
    totalItems,
    itemsPerPage,
    currentPage,
    totalPages,
    onDelete,
    onItemsPerPageChange,
    onPreviousPage,
    onNextPage,
}: UrlTableProps) => {
    return (
        <div className="mt-5 overflow-hidden rounded-2xl border border-gray-300/90 bg-white">
            <div className="flex items-center justify-between border-b border-[#eef2f7] bg-[#fafbfd] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#5f6368]">
                <span>Danh sách đường dẫn</span>
                <span>{totalItems} mục</span>
            </div>

            <div className="hidden border-b border-[#eef2f7] bg-[#fcfdff] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8b939e] md:grid md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.5fr)_180px] md:gap-4">
                <span>Tên + mã</span>
                <span>Ghi chú</span>
                <span>URL</span>
                <span className="text-right">Thao tác</span>
            </div>

            <div className="divide-y divide-[#eef2f7]">
                {paginatedUrls.map((item) => (
                    <div key={item.uuid} className="px-4 py-3 transition hover:bg-[#f8fbff]">
                        <div className="grid gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.5fr)_180px] md:items-start md:gap-4">
                            <div className="min-w-0 flex items-start gap-3">
                                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e8f0fe] text-[#1a73e8]">
                                    <i className="fa-solid fa-link text-xs"></i>
                                </span>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="truncate text-sm font-semibold text-[#202124]">/{item.code || "-"}</p>
                                        <span className="rounded-full border border-gray-300/90 px-2 py-0.5 text-[11px] font-semibold text-[#4d5562]">#{item.uuid.slice(0, 8)}</span>
                                    </div>
                                    <p className="mt-1 text-xs text-[#8b939e]">Tạo ngày: {formatDate(String(item.created_at))}</p>
                                </div>
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-sm text-[#5f6368]">{item.description || "--"}</p>
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-[#202124]">
                                    <a href={item.short_url} target="_blank" rel="noopener noreferrer" className="text-[#1a73e8] hover:underline">
                                        {item.short_url}
                                    </a>
                                </p>
                                {item.original_url && (
                                    <p className="mt-1 truncate text-xs text-[#8b939e]">Gốc: {item.original_url}</p>
                                )}
                            </div>

                            <div className="flex items-start justify-end gap-2">
                                <button
                                    className="inline-flex items-center gap-2 rounded-xl border border-gray-300/90 bg-white px-3 py-1.5 text-xs font-semibold text-[#202124] transition hover:bg-[#f4f7fc]"
                                    onClick={() => window.open(item.short_url, "_blank", "noopener,noreferrer")}
                                >
                                    Mở
                                    <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                                </button>
                                <button
                                    className="inline-flex items-center rounded-xl border border-[#ef4444] px-3 py-1.5 text-xs font-semibold text-[#dc2626] transition hover:bg-[#fef2f2]"
                                    onClick={() => void onDelete(item.uuid)}
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {!loading && totalItems === 0 && (
                    <div className="px-4 py-10 text-center text-sm text-[#5f6368]">
                        Chưa có URL nào phù hợp.
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
                            {[5, 10, 15, 20].map((size) => (
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
                        <span className="text-sm text-[#5f6368]">Trang {currentPage}/{totalPages}</span>
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

export default UrlTable;
