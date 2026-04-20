import { useCallback, useEffect, useMemo, useState } from "react";
import type { CreateUrlForm, UrlListResponse, UrlResponse } from "../../services/types/url.type";
import { useExecute } from "../../common/hooks/useExecute";
import { UrlModule } from "../../services/modules/url.module";
import { useNotificate } from "../../common/hooks/useNotificate";
import CreateUrlModal from "../../components/ui/modal/create-url/create-url-modal";
import UrlPageHero from "../../components/ui/url-page/url-page-hero";
import UrlSearchToolbar from "../../components/ui/url-page/url-search-toolbar";
import UrlTable from "../../components/ui/url-page/url-table";

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
            const idValue = item.uuid.toLowerCase();
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

    const handleDeleteUrl = async (uuid: string) => {
        const accepted = window.confirm("Bạn có chắc muốn xóa đường dẫn này?");
        if (!accepted) {
            return;
        }

        await executeDeleteUrl(
            () => DeleteUrl(uuid),
            {
                onSuccess: async () => {
                    showToast({
                        type: "success",
                        title: "Đã xóa URL",
                        message: `Đường dẫn #${uuid.slice(0, 8)} đã được xóa.`,
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

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    return (
        <div className="space-y-4">
            <UrlPageHero
                onOpenCreate={() => setIsCreateModalOpen(true)}
            />

            <section>
                <UrlSearchToolbar
                    searchInput={searchInput}
                    onSearchInputChange={setSearchInput}
                    onSearch={handleSearch}
                    onReload={handleReload}
                />

                <UrlTable
                    paginatedUrls={paginatedUrls}
                    loading={loading}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onDelete={handleDeleteUrl}
                    onItemsPerPageChange={setItemsPerPage}
                    onPreviousPage={handlePreviousPage}
                    onNextPage={handleNextPage}
                />
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
