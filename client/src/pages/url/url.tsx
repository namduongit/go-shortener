import { useCallback, useEffect, useMemo, useState } from "react";
import type { CreateUrlForm, UrlListResponse, UrlResponse } from "../../services/types/url.type";
import { useExecute } from "../../common/hooks/useExecute";
import { UrlModule } from "../../services/modules/url.modules";
import { formatDate } from "../../services/utils/date";
import { useNotificate } from "../../common/hooks/useNotificate";
import CreateUrlModal from "../../components/ui/modal/create-url/create-url-modal";

const UrlPage = () => {
    const { GetUrls, CreateUrl, DeleteUrl } = UrlModule;
    const { execute, loading } = useExecute<UrlListResponse>();
    const { execute: executeCreateUrl, loading: creatingUrl } = useExecute<UrlResponse>();
    const { execute: executeDeleteUrl } = useExecute<null>();
    const [urls, setUrls] = useState<UrlResponse[]>([]);
    const [searchInput, setSearchInput] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { showToast } = useNotificate();

    const fetchUrls = useCallback(async () => {
        await execute(() => GetUrls(), {
            onSuccess: (data) => {
                if (data && Array.isArray(data.urls)) {
                    setUrls(data.urls);
                } else {
                    setUrls([]);
                }
            },
            onError: () => {
                setUrls([]);
                showToast({
                    type: "error",
                    title: "Không thể tải URL",
                    message: "Vui lòng thử lại sau vài giây.",
                });
            }
        });
    }, []);

    const filteredUrls = useMemo(() => {
        const keyword = searchKeyword.trim().toLowerCase();
        if (!keyword) {
            return urls;
        }

        return urls.filter((item) => {
            const idValue = String(item.id);
            const codeValue = (item.code ?? "").toLowerCase();
            const longUrl = (item.short_url ?? "").toLowerCase();
            const originalUrl = (item.original_url ?? "").toLowerCase();
            const description = (item.description ?? "").toLowerCase();

            return (
                idValue.includes(keyword) ||
                codeValue.includes(keyword) ||
                longUrl.includes(keyword) ||
                originalUrl.includes(keyword) ||
                description.includes(keyword)
            );
        });
    }, [urls, searchKeyword]);

    const totalItems = filteredUrls.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    const paginatedUrls = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredUrls.slice(start, end);
    }, [filteredUrls, currentPage, itemsPerPage]);

    useEffect(() => {
        void fetchUrls();
    }, [fetchUrls]);

    const handleSearch = () => {
        setSearchKeyword(searchInput.trim());
        setCurrentPage(1);
    };

    const handleReload = async () => {
        await fetchUrls();
        setCurrentPage(1);
        showToast({
            type: "info",
            title: "Đã tải lại",
            message: "Danh sách URL đã được cập nhật.",
        });
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const handleCreateUrl = async (payload: CreateUrlForm) => {
        await executeCreateUrl(
            () => CreateUrl(payload),
            {
                onSuccess: async () => {
                    setIsCreateModalOpen(false);
                    showToast({
                        type: "success",
                        title: "Tạo URL thành công",
                        message: "Đường dẫn rút gọn mới đã được tạo.",
                    });
                    await fetchUrls();
                },
                onError: () => {
                    showToast({
                        type: "error",
                        title: "Tạo URL thất bại",
                        message: "Vui lòng kiểm tra dữ liệu đầu vào và thử lại.",
                    });
                },
            }
        );
    };

    const handleDeleteUrl = async (id: number) => {
        const accepted = window.confirm("Bạn có chắc muốn xóa đường dẫn này?");
        if (!accepted) {
            return;
        }

        await executeDeleteUrl(
            () => DeleteUrl(id),
            {
                onSuccess: async () => {
                    showToast({
                        type: "success",
                        title: "Đã xóa URL",
                        message: `Đường dẫn #${id} đã được xóa.`,
                    });
                    await fetchUrls();
                },
                onError: () => {
                    showToast({
                        type: "error",
                        title: "Xóa URL thất bại",
                        message: "Không thể xóa URL. Vui lòng thử lại.",
                    });
                },
            }
        );
    };

    return (
        <div className="space-y-5">
            <header className="rounded-3xl border border-[#e3e8f2] bg-[#f8fbff] p-5 md:p-7">
                <p className="text-sm font-semibold text-[#5f6368]">Quản lý URL</p>
                <h1 className="mt-1 text-3xl font-semibold text-[#202124] md:text-4xl">Kho đường dẫn rút gọn</h1>
                <p className="mt-2 text-sm text-[#5f6368]">Theo dõi mã rút gọn và đường dẫn gốc theo phong cách gọn, dễ quét như Google Drive.</p>
                <div className="mt-5 flex flex-col gap-3 md:flex-row">
                    <button
                        className="rounded-full border border-[#d4dded] bg-white px-5 py-2 text-sm font-semibold text-[#1a73e8] transition hover:bg-[#edf3fe]"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        Tạo URL mới
                    </button>
                    <button className="rounded-full bg-[#1a73e8] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#175fc0]">
                        Xuất thống kê
                    </button>
                </div>
            </header>

            <section className="rounded-3xl border border-[#e3e8f2] bg-white p-4 md:p-6">
                <div className="flex flex-col gap-3 rounded-2xl border border-[#e5eaf4] bg-[#fafbfd] px-4 py-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex w-full items-center gap-2 md:max-w-xl">
                        <div className="flex h-10 w-full items-center gap-2 rounded-xl border border-[#d9e1ef] bg-white px-3">
                            <i className="fa-solid fa-magnifying-glass text-xs text-[#5f6368]"></i>
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        handleSearch();
                                    }
                                }}
                                placeholder="Tìm theo mã, id, URL"
                                className="w-full bg-transparent text-sm text-[#202124] outline-none placeholder:text-[#8b939e]"
                            />
                        </div>
                        <button
                            className="rounded-xl border border-[#d9e1ef] bg-white px-3 py-2 text-sm font-semibold text-[#202124] transition hover:bg-[#f4f7fc]"
                            onClick={handleSearch}
                        >
                            Tìm
                        </button>
                    </div>

                    <button
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d9e1ef] bg-white px-3 py-2 text-sm font-semibold text-[#202124] transition hover:bg-[#f4f7fc]"
                        onClick={() => void handleReload()}
                    >
                        <i className="fa-solid fa-rotate-right text-xs"></i>
                        Reload
                    </button>
                </div>

                <div className="mt-5 overflow-hidden rounded-2xl border border-[#e5eaf4] bg-white">
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
                            <div key={item.id} className="px-4 py-3 transition hover:bg-[#f8fbff]">
                                <div className="grid gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.5fr)_180px] md:items-start md:gap-4">
                                    <div className="min-w-0 flex items-start gap-3">
                                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e8f0fe] text-[#1a73e8]">
                                            <i className="fa-solid fa-link text-xs"></i>
                                        </span>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="truncate text-sm font-semibold text-[#202124]">/{item.code || "-"}</p>
                                                <span className="rounded-full border border-[#d9e1ef] px-2 py-0.5 text-[11px] font-semibold text-[#4d5562]">#{item.id}</span>
                                            </div>
                                            <p className="mt-1 text-xs text-[#8b939e]">Tạo ngày: {formatDate(item.created_at)}</p>
                                        </div>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm text-[#5f6368]">{item.description || "--"}</p>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-[#202124]">
                                            <a href={item.short_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                {item.short_url}
                                            </a>
                                        </p>
                                        {item.original_url && (
                                            <p className="mt-1 truncate text-xs text-[#8b939e]">Gốc: {item.original_url}</p>
                                        )}
                                    </div>

                                    <div className="flex items-start justify-end gap-2">
                                        <button
                                            className="inline-flex items-center gap-2 rounded-xl border border-[#d9e1ef] bg-white px-3 py-1.5 text-xs font-semibold text-[#202124] transition hover:bg-[#f4f7fc]"
                                            onClick={() => window.open(item.short_url, "_blank", "noopener,noreferrer")}
                                        >
                                            Mở
                                            <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                                        </button>
                                        <button
                                            className="inline-flex items-center rounded-xl border border-[#ef4444] px-3 py-1.5 text-xs font-semibold text-[#dc2626] transition hover:bg-[#fef2f2]"
                                            onClick={() => void handleDeleteUrl(item.id)}
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
                                    onChange={(event) => setItemsPerPage(Number(event.target.value))}
                                    className="rounded-lg border border-[#d9e1ef] bg-white px-2 py-1 text-sm text-[#202124] outline-none"
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
                                    className="rounded-lg border border-[#d9e1ef] bg-white px-3 py-1 text-sm font-semibold text-[#202124] disabled:cursor-not-allowed disabled:opacity-50"
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    Trước
                                </button>
                                <span className="text-sm text-[#5f6368]">Trang {currentPage}/{totalPages}</span>
                                <button
                                    className="rounded-lg border border-[#d9e1ef] bg-white px-3 py-1 text-sm font-semibold text-[#202124] disabled:cursor-not-allowed disabled:opacity-50"
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <CreateUrlModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateUrl}
                submitting={creatingUrl}
            />
        </div>
    );
};

export default UrlPage;
