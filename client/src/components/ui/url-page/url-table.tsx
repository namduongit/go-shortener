import type { UrlResponse } from "../../../services/types/url.type";
import { formatDate } from "../../../services/utils/date";
import Button from "../button/button";

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
        <div className="mt-2 overflow-hidden bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <span>Danh sách đường dẫn</span>
                <span>{totalItems} mục</span>
            </div>

            <div className="hidden border-b border-gray-200 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 md:grid md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.5fr)_180px] md:gap-4">
                <span>Tên + mã</span>
                <span>Ghi chú</span>
                <span>URL</span>
                <span className="text-right">Thao tác</span>
            </div>

            <div className="divide-y divide-gray-200">
                {paginatedUrls.map((item) => (
                    <div key={item.uuid} className="px-4 py-3 hover:bg-gray-50">
                        <div className="grid gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.5fr)_180px] md:items-start md:gap-4">
                            <div className="min-w-0 flex items-start gap-3">
                                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-gray-300 bg-white text-gray-600">
                                    <i className="fa-solid fa-link text-xs"></i>
                                </span>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="truncate text-sm font-semibold text-gray-900">{item.code || "-"}</p>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">Tạo ngày: {formatDate(String(item.created_at))}</p>
                                </div>
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-sm text-gray-600">{item.description || "--"}</p>
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-gray-900">
                                    <a href={`${import.meta.env.VITE_ENDPOINT_SHORT_URL}/${item.code}`} target="_blank" rel="noopener noreferrer" className="text-[#1a73e8] hover:underline">
                                        {`${import.meta.env.VITE_ENDPOINT_SHORT_URL}/${item.code}`}
                                    </a>
                                </p>
                                {item.original_url && (
                                    <p className="mt-1 truncate text-xs text-gray-500">Gốc: {item.original_url}</p>
                                )}
                            </div>

                            <div className="flex items-start justify-end gap-2">
                                <Button
                                    type="button"
                                    className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 hover:bg-gray-100"
                                    onClick={() => window.open(`${import.meta.env.VITE_ENDPOINT_SHORT_URL}/${item.code}`, "_blank", "noopener,noreferrer")}
                                >
                                    Mở
                                    <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                                </Button>
                                <Button
                                    type="button"
                                    className="inline-flex items-center rounded-md border border-[#ef4444] px-3 py-1.5 text-xs font-semibold text-[#dc2626] hover:bg-[#fef2f2]"
                                    onClick={() => void onDelete(item.uuid)}
                                >
                                    Xóa
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}

                {!loading && totalItems === 0 && (
                    <div className="px-4 py-10 text-center text-sm text-gray-500">
                        Chưa có URL nào phù hợp.
                    </div>
                )}
            </div>

            {totalItems > 0 && (
                <div className="flex flex-col items-start justify-between gap-3 border-t border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 md:flex-row md:items-center">
                    <div className="flex items-center gap-2">
                        <span>Hiển thị</span>
                        <select
                            value={itemsPerPage}
                            onChange={(event) => onItemsPerPageChange(Number(event.target.value))}
                            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 outline-none"
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
                        <Button
                            type="button"
                            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-semibold text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={onPreviousPage}
                            disabled={currentPage === 1}
                        >
                            Trước
                        </Button>
                        <span className="text-sm text-gray-500">Trang {currentPage}/{totalPages}</span>
                        <Button
                            type="button"
                            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-semibold text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={onNextPage}
                            disabled={currentPage === totalPages}
                        >
                            Sau
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UrlTable;
