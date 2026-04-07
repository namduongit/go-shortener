import { useCallback, useEffect, useMemo, useState } from "react";
import { FileModule } from "../../services/modules/file.module";
import { FolderModule } from "../../services/modules/folder.module";
import CreateFolderModal from "../../components/ui/modal/create-folder/create-folder-modal";
import CreateFileModal from "../../components/ui/modal/create-file/create-file-modal";
import { useExecute } from "../../common/hooks/useExecute";
import type { FileListResponse, FileResponse } from "../../services/types/file.type";
import type { FolderListResponse, FolderResponse } from "../../services/types/folder.type";
import { usePlanUsage } from "../../common/hooks/usePlanUsage";
import { normalizeFolderName } from "../../services/utils/folder";
import { useNotificate } from "../../common/hooks/useNotificate";
import SideFile from "../../components/ui/sidefile/sidefile";
import FilePageHero from "../../components/ui/file-page/file-page-hero";
import FileBreadcrumb from "../../components/ui/file-page/file-breadcrumb";
import FileSearchToolbar from "../../components/ui/file-page/file-search-toolbar";
import FileExplorer from "../../components/ui/file-page/file-explorer";
import UploadTargetBanner from "../../components/ui/file-page/upload-target-banner";

const DEFAULT_ITEMS_PER_PAGE = 5;
const ROW_MIN_HEIGHT_PX = 60;

const FilePage = () => {
    const { GetFiles, UploadFile } = FileModule;
    const { GetFolders, CreateFolder } = FolderModule;

    const { execute: executeGetFiles, loading } = useExecute<FileListResponse>();
    const { execute: executeGetFolders } = useExecute<FolderListResponse>();

    const { execute: executeCreateFolder } = useExecute<FolderResponse>();
    const { execute: executeUpload, loading: uploading } = useExecute<FileResponse>();

    const { refreshPlanUsage } = usePlanUsage();
    const { showToast } = useNotificate();

    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [isCreateFileOpen, setIsCreateFileOpen] = useState(false);

    const [files, setFiles] = useState<FileResponse[]>([]);
    const [customFolders, setCustomFolders] = useState<FolderResponse[]>([]);

    const [path, setPath] = useState<string[]>([]);
    const [itemsPerPage, setItemsPerPage] = useState<number>(DEFAULT_ITEMS_PER_PAGE);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [searchInput, setSearchInput] = useState<string>("");
    const [searchKeyword, setSearchKeyword] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<FileResponse | null>(null);
    const [uploadingFileName, setUploadingFileName] = useState<string>("");

    const currentFolder = path.length ? path[path.length - 1] : null;

    const folderNameById = useMemo(() => {
        return new Map(customFolders.map((folder) => [folder.uuid, folder.name.trim()]));
    }, [customFolders]);

    const resolveFileFolderName = useCallback((file: FileResponse): string => {
        if (typeof file.folder_uuid === "string" && file.folder_uuid.trim()) {
            const folderName = folderNameById.get(file.folder_uuid);
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
            ? files.filter((item) => normalizeFolderName(resolveFileFolderName(item)) === "root")
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
            key: `file-${file.uuid}`,
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
    const tableViewportRows = itemsPerPage + 1;

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

        const stillExists = files.some((file) => file.uuid === selectedFile.uuid);
        if (!stillExists) {
            setSelectedFile(null);
        }
    }, [files, selectedFile]);

    const handleCreateFolder = async (folderName: string) => {
        await executeCreateFolder(
            () => CreateFolder({ name: folderName }),
            {
                onSuccess: (data) => {
                    if (data) {
                        setCustomFolders((prev) => [data, ...prev.filter((item) => item.uuid !== data.uuid)]);
                    }
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
        setUploadingFileName(selectedFile.name);
        setIsCreateFileOpen(false);

        const selectedFolder =
            customFolders.find((folder) => folder.name.trim() === (currentFolder ?? "").trim())?.uuid;

        await executeUpload(
            () => UploadFile({ file: selectedFile, folder: selectedFolder }),
            {
                onSuccess: () => {
                    setUploadingFileName("");
                    showToast({
                        type: "success",
                        title: "Upload thành công",
                        message: `File ${selectedFile.name} đã được tải lên.`,
                    });
                    void loadFiles();
                    void refreshPlanUsage();
                },
                onError: () => {
                    setUploadingFileName("");
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

    const handleGoRoot = () => {
        setPath([]);
    };

    const handleGoPath = (index: number) => {
        setPath(path.slice(0, index + 1));
    };

    const handleToggleSelectedFile = (file: FileResponse) => {
        setSelectedFile((prev) => (prev?.uuid === file.uuid ? null : file));
    };

    const handleOpenFolder = (folderName: string) => {
        setPath([folderName]);
    };

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    return (
        <div className="space-y-5">
            <FilePageHero
                onOpenCreateFolder={() => setIsCreateFolderOpen(true)}
                onOpenUploadFile={() => setIsCreateFileOpen(true)}
            />

            <section className="space-y-4">
                <FileBreadcrumb path={path} onGoRoot={handleGoRoot} onGoPath={handleGoPath} />

                <FileSearchToolbar
                    searchInput={searchInput}
                    onSearchInputChange={setSearchInput}
                    onSearch={handleSearch}
                    onReload={handleReload}
                />

                <div className={`mt-5 grid gap-4 ${selectedFile ? "lg:grid-cols-[minmax(0,1fr)_340px]" : "lg:grid-cols-1"}`}>
                    <FileExplorer
                        currentFolder={currentFolder}
                        tableViewportRows={tableViewportRows}
                        rowMinHeight={ROW_MIN_HEIGHT_PX}
                        paginatedItems={paginatedItems}
                        selectedFile={selectedFile}
                        resolveFileFolderName={resolveFileFolderName}
                        onToggleFile={handleToggleSelectedFile}
                        onOpenFolder={handleOpenFolder}
                        loading={loading}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onItemsPerPageChange={setItemsPerPage}
                        onPreviousPage={handlePreviousPage}
                        onNextPage={handleNextPage}
                    />

                    {selectedFile && (
                        <SideFile
                            file={selectedFile}
                            onClose={() => setSelectedFile(null)}
                            onFileDeleted={() => {
                                void loadFiles();
                                void refreshPlanUsage();
                            }}
                            resolveFileFolderName={resolveFileFolderName}
                        />
                    )}
                </div>

                <UploadTargetBanner currentFolder={currentFolder} onGoRoot={handleGoRoot} />
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

            {uploading && (
                <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl border border-gray-300/90 bg-white px-4 py-3 shadow-[0_12px_30px_rgba(34,61,102,0.16)]">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#cfe0fc] border-t-[#1a73e8]"></span>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Đang tải tệp lên...</p>
                        <p className="max-w-52 truncate text-xs text-gray-500">{uploadingFileName || "Vui lòng chờ"}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilePage;
