import { useCallback, useEffect, useMemo, useState } from "react";
import { FileModule } from "../../services/modules/file.module";
import { FolderModule } from "../../services/modules/folder.module";
import CreateFolderModal from "../../components/ui/modal/create-folder/create-folder-modal";
import CreateFileModal from "../../components/ui/modal/create-file/create-file-modal";
import { useExecute } from "../../common/hooks/useExecute";
import { formatDate } from "../../services/utils/date";
import type { FileListResponse, FileResponse } from "../../services/types/file.type";
import type { FolderListResponse, FolderResponse } from "../../services/types/folder.type";
import { useNotificate } from "../../common/hooks/useNotificate";

const normalizeFolderName = (folderName?: string | null): string => {
    const value = folderName?.trim();
    return value ? value : "root";
};

const formatFileSize = (size: number) => {
    if (size < 1024) {
        return `${size} B`;
    }
    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} KB`;
    }
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const FilePage = () => {
    const { GetFiles, UploadFile, DeleteFile, DownloadFile } = FileModule;
    const { GetFolders, CreateFolder } = FolderModule;
    const { execute: executeGetFiles, loading } = useExecute<FileListResponse>();
    const { execute: executeGetFolders } = useExecute<FolderListResponse>();

    const { execute: executeCreateFolder } = useExecute<FolderResponse>();
    const { execute: executeUpload } = useExecute<FileResponse>();
    const { execute: executeDelete } = useExecute<null>();
    const { showToast } = useNotificate();

    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [isCreateFileOpen, setIsCreateFileOpen] = useState(false);

    const [files, setFiles] = useState<FileResponse[]>([]);
    const [customFolders, setCustomFolders] = useState<FolderResponse[]>([]);

    const [path, setPath] = useState<string[]>([]);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [searchInput, setSearchInput] = useState<string>("");
    const [searchKeyword, setSearchKeyword] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<FileResponse | null>(null);

    const currentFolder = path.length ? path[path.length - 1] : null;

    const folderNameById = useMemo(() => {
        return new Map(customFolders.map((folder) => [folder.id, folder.name.trim()]));
    }, [customFolders]);

    const resolveFileFolderName = useCallback((file: FileResponse): string => {
        if (typeof file.folder_id === "number") {
            const folderName = folderNameById.get(file.folder_id);
            if (folderName) {
                return folderName;
            }
        }

        return normalizeFolderName(file.folder_name);
    }, [folderNameById]);

    const getFolderOptions = useCallback(() => {
        const fromFiles = files
            .map((item) => resolveFileFolderName(item))
            .filter((name) => normalizeFolderName(name) !== "root")
            .filter((name): name is string => Boolean(name && name.trim()))
            .map((name) => name.trim());

        const fromCustom = customFolders.map((folder) => folder.name.trim());

        return Array.from(new Set([...fromFiles, ...fromCustom]));
    }, [files, customFolders, resolveFileFolderName]);

    const folderOptions = useMemo(() => getFolderOptions(), [getFolderOptions]);

    const loadFiles = useCallback(async () => {
        await executeGetFiles(() => GetFiles(), {
            onSuccess: (data) => {
                if (data && Array.isArray(data.files)) {
                    setFiles(data.files);
                    return;
                }
                setFiles([]);
            },
            onError: () => {
                setFiles([]);
                showToast({
                    type: "error",
                    title: "Không thể tải danh sách file",
                    message: "Vui lòng thử lại sau vài giây.",
                });
            },
        });
    }, []);

    const loadFolders = useCallback(async () => {
        await executeGetFolders(() => GetFolders(), {
            onSuccess: (data) => {
                if (data && Array.isArray(data.folders)) {
                    setCustomFolders(data.folders);
                    return;
                }
                setCustomFolders([]);
            },
            onError: () => {
                setCustomFolders([]);
                showToast({
                    type: "error",
                    title: "Không thể tải danh sách thư mục",
                    message: "Vui lòng thử lại sau vài giây.",
                });
            },
        });
    }, []);

    const visibleFolders = useMemo(() => {
        if (currentFolder) {
            return [];
        }
        if (!searchKeyword.trim()) {
            return folderOptions;
        }

        const keyword = searchKeyword.trim().toLowerCase();
        return folderOptions.filter((folderName) => folderName.toLowerCase().includes(keyword));
    }, [currentFolder, folderOptions, searchKeyword]);

    const visibleFiles = useMemo(() => {
        const keyword = searchKeyword.trim().toLowerCase();

        const baseFiles = !currentFolder
            ? files
            : files.filter((item) => normalizeFolderName(resolveFileFolderName(item)) === normalizeFolderName(currentFolder));

        if (!keyword) {
            return baseFiles;
        }

        return baseFiles.filter((item) => {
            const fileName = item.file_name.toLowerCase();
            const folderName = resolveFileFolderName(item).toLowerCase();
            const fileType = item.file_type.toLowerCase();

            return fileName.includes(keyword) || folderName.includes(keyword) || fileType.includes(keyword);
        });
    }, [files, currentFolder, resolveFileFolderName, searchKeyword]);

    const explorerItems = useMemo(() => {
        const fileItems = visibleFiles.map((file) => ({
            kind: "file" as const,
            key: `file-${file.id}`,
            file,
        }));

        const folderItems = visibleFolders.map((folderName) => ({
            kind: "folder" as const,
            key: `folder-${folderName}`,
            folderName,
        }));

        return [...fileItems, ...folderItems];
    }, [visibleFiles, visibleFolders]);

    const totalItems = explorerItems.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return explorerItems.slice(start, end);
    }, [explorerItems, currentPage, itemsPerPage]);

    useEffect(() => {
        void loadFolders();
        void loadFiles();
    }, [loadFiles, loadFolders]);

    useEffect(() => {
        setCurrentPage(1);
    }, [currentFolder, itemsPerPage]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    useEffect(() => {
        if (!selectedFile) {
            return;
        }

        const stillExists = files.some((file) => file.id === selectedFile.id);
        if (!stillExists) {
            setSelectedFile(null);
        }
    }, [files, selectedFile]);

    const handleCreateFolder = async (folderName: string) => {
        await executeCreateFolder(
            () => CreateFolder({ name: folderName }),
            {
                onSuccess: () => {
                    setCustomFolders((prev) => [
                        {
                            id: Date.now(),
                            name: folderName,
                            total_files: 0,
                            created_at: new Date().toISOString(),
                        },
                        ...prev,
                    ]);
                    showToast({
                        type: "success",
                        title: "Đã tạo thư mục",
                        message: `Thư mục ${folderName} đã sẵn sàng.`,
                    });
                },
                onError: () => {
                    showToast({
                        type: "error",
                        title: "Tạo thư mục thất bại",
                        message: "Vui lòng kiểm tra kết nối và thử lại.",
                    });
                },
            }
        );
    };

    const handleUpload = async (selectedFile: File) => {
        const selectedFolderId =
            customFolders.find((folder) => folder.name.trim() === (currentFolder ?? "").trim())?.id ?? 0;

        await executeUpload(
            () => UploadFile({ file: selectedFile, folderID: selectedFolderId }),
            {
                onSuccess: () => {
                    setIsCreateFileOpen(false);
                    showToast({
                        type: "success",
                        title: "Upload thành công",
                        message: `File ${selectedFile.name} đã được tải lên.`,
                    });
                    void loadFiles();
                },
                onError: () => {
                    showToast({
                        type: "error",
                        title: "Upload thất bại",
                        message: "Không thể tải file. Vui lòng thử lại.",
                    });
                },
            }
        );
    };

    const handleSearch = () => {
        setSearchKeyword(searchInput.trim());
        setCurrentPage(1);
    };

    const handleReload = async () => {
        await Promise.all([loadFolders(), loadFiles()]);
        setCurrentPage(1);
        showToast({
            type: "info",
            title: "Đã tải lại dữ liệu",
            message: "Danh sách file và thư mục đã được cập nhật.",
        });
    };

    const handleDownloadFile = async (file: FileResponse) => {
        try {
            const blob = await DownloadFile(file.id);
            const objectUrl = window.URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = objectUrl;
            anchor.download = file.file_name;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.URL.revokeObjectURL(objectUrl);
        } catch {
            showToast({
                type: "error",
                title: "Tải file thất bại",
                message: "Không thể tải file này vào lúc này.",
            });
        }
    };

    const handleDeleteFile = async (file: FileResponse) => {
        const confirmDelete = window.confirm(`Bạn có chắc muốn xóa file ${file.file_name}?`);
        if (!confirmDelete) {
            return;
        }

        const deleted = await executeDelete(
            () => DeleteFile(file.id),
            {
                onSuccess: () => {
                    showToast({
                        type: "success",
                        title: "Đã xóa file",
                        message: `${file.file_name} đã được xóa.`,
                    });
                },
                onError: () => {
                    showToast({
                        type: "error",
                        title: "Xóa file thất bại",
                        message: "Không thể xóa file. Vui lòng thử lại.",
                    });
                },
            }
        );

        if (typeof deleted !== "undefined") {
            setSelectedFile((prev) => (prev?.id === file.id ? null : prev));
            await loadFiles();
        }
    };

    return (
        <div className="space-y-5">
            <header className="rounded-3xl border border-[#e3e8f2] bg-[#f8fbff] p-5 md:p-7">
                <p className="text-sm font-semibold text-[#5f6368]">Quản lý file</p>
                <h1 className="mt-1 text-3xl font-semibold text-[#202124] md:text-4xl">Không gian lưu trữ GMS</h1>
                <p className="mt-2 text-sm text-[#5f6368]">Tổ chức file theo thư mục hoặc để trực tiếp ở root giống Google Drive.</p>
                <div className="mt-5 flex flex-col gap-3 md:flex-row">
                    <button
                        className="rounded-full border border-[#d4dded] bg-white px-5 py-2 text-sm font-semibold text-[#1a73e8] transition hover:bg-[#edf3fe]"
                        onClick={() => setIsCreateFolderOpen(true)}
                    >
                        Tạo thư mục
                    </button>
                    <button
                        className="rounded-full bg-[#1a73e8] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#175fc0]"
                        onClick={() => setIsCreateFileOpen(true)}
                    >
                        Tải tệp lên
                    </button>
                </div>
            </header>

            <section className="rounded-3xl border border-[#e3e8f2] bg-white p-4 md:p-6">
                <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#e5eaf4] bg-[#fafbfd] px-4 py-3 text-sm text-[#5f6368]">
                    <button
                        className="rounded-lg px-2 py-1 font-semibold text-[#1a73e8] hover:bg-[#e8f0fe]"
                        onClick={() => setPath([])}
                    >
                        GMS Cloud
                    </button>
                    {path.map((item, index) => (
                        <div key={item} className="flex items-center gap-2">
                            <span>/</span>
                            <button
                                className="rounded-lg px-2 py-1 font-semibold text-[#1a73e8] hover:bg-[#e8f0fe]"
                                onClick={() => setPath(path.slice(0, index + 1))}
                            >
                                {item}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-[#e5eaf4] bg-[#fafbfd] px-4 py-3 md:flex-row md:items-center md:justify-between">
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
                                placeholder="Tìm theo tên file, thư mục, loại file"
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

                <div className={`mt-5 grid gap-4 ${selectedFile ? "lg:grid-cols-[minmax(0,1fr)_340px]" : "lg:grid-cols-1"}`}>
                    <div className="overflow-hidden rounded-2xl border border-[#e5eaf4] bg-white">
                    <div className="flex items-center justify-between border-b border-[#eef2f7] bg-[#fafbfd] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#5f6368]">
                        <span>Tệp và thư mục</span>
                        <span>{currentFolder ?? "GMS Cloud"}</span>
                    </div>

                    <div className="divide-y divide-[#eef2f7]">
                        {paginatedItems.map((item) => {
                            if (item.kind === "file") {
                                return (
                                    <button
                                        key={item.key}
                                        className={`flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-[#f8fbff] ${selectedFile?.id === item.file.id ? "bg-[#eef4ff]" : "bg-white"}`}
                                        onClick={() =>
                                            setSelectedFile((prev) => (prev?.id === item.file.id ? null : item.file))
                                        }
                                    >
                                        <div className="min-w-0 flex items-center gap-3">
                                            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e8f0fe] text-[#1a73e8]">
                                                <i className="fa-regular fa-file"></i>
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-[#202124]">{item.file.file_name}</p>
                                                <p className="truncate text-xs text-[#5f6368]">
                                                    {item.file.file_type} · {formatFileSize(item.file.size)} · {formatDate(item.file.uploaded_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="ml-4 shrink-0 text-xs text-[#5f6368]">{resolveFileFolderName(item.file)}</span>
                                    </button>
                                );
                            }

                            return (
                                <button
                                    key={item.key}
                                    className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-[#f8fbff]"
                                    onClick={() => setPath([item.folderName])}
                                >
                                    <div className="min-w-0 flex items-center gap-3">
                                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#fff6df] text-[#b26a00]">
                                            <i className="fa-solid fa-folder"></i>
                                        </span>
                                        <p className="truncate text-sm font-semibold text-[#202124]">{item.folderName}</p>
                                    </div>
                                    <span className="ml-4 shrink-0 text-xs text-[#5f6368]">Mở</span>
                                </button>
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
                                <span className="text-sm text-[#5f6368]">
                                    Trang {currentPage}/{totalPages}
                                </span>
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

                    {selectedFile && (
                    <aside className="rounded-2xl border border-[#e5eaf4] bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5f6368]">Chi tiết file</p>

                            <div className="mt-4 space-y-4">
                                <div className="rounded-2xl border border-[#e5eaf4] bg-[#fafbfd] p-4">
                                    <p className="truncate text-sm font-semibold text-[#202124]">{selectedFile.file_name}</p>
                                    <p className="mt-1 text-xs text-[#5f6368]">{selectedFile.content_type}</p>
                                </div>

                                <div className="space-y-2 text-sm text-[#5f6368]">
                                    <p>
                                        <span className="font-semibold text-[#202124]">Loại:</span> {selectedFile.file_type}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-[#202124]">Dung lượng:</span> {formatFileSize(selectedFile.size)}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-[#202124]">Ngày tải:</span> {formatDate(selectedFile.uploaded_at)}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-[#202124]">Vị trí:</span> {resolveFileFolderName(selectedFile)}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2 pt-2">
                                    <button
                                        className="rounded-xl bg-[#1a73e8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#175fc0]"
                                        onClick={() => void handleDownloadFile(selectedFile)}
                                    >
                                        Tải xuống
                                    </button>
                                    <button
                                        className="rounded-xl border border-[#ef4444] px-4 py-2 text-sm font-semibold text-[#dc2626] transition hover:bg-[#fef2f2]"
                                        onClick={() => void handleDeleteFile(selectedFile)}
                                    >
                                        Xóa file
                                    </button>
                                    <button
                                        className="rounded-xl border border-[#d9e1ef] px-4 py-2 text-sm font-semibold text-[#202124] transition hover:bg-[#f8fafc]"
                                        onClick={() => setSelectedFile(null)}
                                    >
                                        Đóng chi tiết
                                    </button>
                                </div>
                            </div>
                    </aside>
                    )}
                </div>

                <div className="mt-4 rounded-2xl border border-[#e5eaf4] bg-[#f8fbff] px-4 py-3 text-sm text-[#5f6368]">
                    Upload hiện tại sẽ lưu vào: <strong className="text-[#202124]">{currentFolder ?? "root"}</strong>
                    {currentFolder && (
                        <button
                            className="ml-3 rounded-full border border-[#d4dded] px-3 py-1 text-xs font-semibold text-[#1a73e8] hover:bg-[#e8f0fe]"
                            onClick={() => setPath([])}
                        >
                            Về root
                        </button>
                    )}
                </div>
            </section>

            <CreateFolderModal
                isOpen={isCreateFolderOpen}
                onClose={() => setIsCreateFolderOpen(false)}
                onSubmit={handleCreateFolder}
            />

            <CreateFileModal
                isOpen={isCreateFileOpen}
                onClose={() => setIsCreateFileOpen(false)}
                onSubmit={handleUpload}
                destinationLabel={currentFolder ?? "root"}
            />
        </div>
    );
};

export default FilePage;
