import { useEffect, useRef, useState } from "react";
import type { FileResponse } from "../../../services/types/file.type";
import type { FolderResponse } from "../../../services/types/folder.type";
import { formatDriveDate } from "../../../services/utils/date";
import { formatFileSize, getIconForFileType } from "../../../services/utils/file";
// import folderIcon from "../../../assets/icons/folder-icon.png";
import Button from "../button/button";

export type ViewMode = "list" | "grid";

type FileExplorerProps = {
    files: FileResponse[];
    folders: FolderResponse[];
    viewMode?: ViewMode;
    onOpenFolder?: (folder: FolderResponse) => void;
    onRenameFolder?: (folder: FolderResponse) => void;
    onDeleteFolder?: (folder: FolderResponse) => void;
    onShareFile?: (file: FileResponse) => void;
    onDeleteFile?: (file: FileResponse) => void;
    onDownloadFile?: (file: FileResponse) => void;
    onPreviewImage?: (file: FileResponse) => void;
};

const isImage = (f: FileResponse) => f.content_type?.startsWith("image/");

const FolderRow = ({
    folder,
    onOpen,
    onRename,
    onDelete,
    menuKey,
    setMenuKey,
}: {
    folder: FolderResponse;
    onOpen?: () => void;
    onRename?: () => void;
    onDelete?: () => void;
    menuKey: string | null;
    setMenuKey: (k: string | null) => void;
}) => {
    const key = `folder-${folder.uuid}`;
    return (
        <div
            className="group grid grid-cols-[minmax(0,2fr)_140px_120px_90px_2rem] items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={onOpen}
        >
            <div className="flex items-center gap-2.5 truncate font-medium text-gray-800">
                <i className="fa-solid fa-folder text-xl text-gray-600"></i>
                <span className="truncate">{folder.name}</span>
            </div>
            <span className="text-gray-500 text-xs">{formatDriveDate(folder.created_at)}</span>
            <span className="text-gray-500 text-xs">{formatFileSize(folder.total_size)}</span>
            <span className="text-gray-500 text-xs">{folder.total_files} tệp</span>

            <div className="relative flex justify-end" onClick={(e) => e.stopPropagation()}>
                <Button
                    className="invisible rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 group-hover:visible transition-colors"
                    onClick={() => setMenuKey(menuKey === key ? null : key)}
                >
                    <i className="fa-solid fa-ellipsis-vertical text-xs" />
                </Button>

                {menuKey === key && (
                    <div className="absolute right-0 top-7 z-20 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                        <Button
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => {
                                setMenuKey(null);
                                onRename?.();
                            }}
                        >
                            <i className="fa-regular fa-pen-to-square w-4 text-center text-gray-400" />
                            Đổi tên
                        </Button>
                        <div className="mx-4 h-px bg-gray-100" />
                        <Button
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                            onClick={() => { setMenuKey(null); onDelete?.(); }}
                        >
                            <i className="fa-regular fa-trash-can w-4 text-center text-red-400" />
                            Xóa
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

const FileRow = ({
    file,
    onPreview,
    onShare,
    onDelete,
    onDownload,
    menuKey,
    setMenuKey,
}: {
    file: FileResponse;
    onPreview?: () => void;
    onShare?: () => void;
    onDelete?: () => void;
    onDownload?: () => void;
    menuKey: string | null;
    setMenuKey: (k: string | null) => void;
}) => {
    const key = `file-${file.uuid}`;
    return (
        <div
            className="group grid grid-cols-[minmax(0,2fr)_140px_120px_90px_2rem] items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors cursor-default"
            onClick={() => isImage(file) && onPreview?.()}
        >
            <div className="flex items-center gap-2.5 truncate font-medium text-gray-800">
                <img src={getIconForFileType(file.content_type)} alt="" className="h-5 w-5 shrink-0" />
                <span className="truncate">{file.file_name}</span>
                {file.is_shared && (
                    <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        Công khai
                    </span>
                )}
            </div>
            <span className="text-gray-500 text-xs">{formatDriveDate(file.uploaded_at)}</span>
            <span className="text-gray-500 text-xs">{formatFileSize(file.size)}</span>
            <span className="text-gray-400 text-xs">—</span>

            <div className="relative flex justify-end" onClick={(e) => e.stopPropagation()}>
                <Button
                    className="invisible rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 group-hover:visible transition-colors"
                    onClick={() => setMenuKey(menuKey === key ? null : key)}
                >
                    <i className="fa-solid fa-ellipsis-vertical text-xs" />
                </Button>

                {menuKey === key && (
                    <div className="absolute right-0 top-7 z-20 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                        {isImage(file) && (
                            <Button
                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                                onClick={() => { setMenuKey(null); onPreview?.(); }}
                            >
                                <i className="fa-regular fa-image w-4 text-center text-gray-400" />
                                Xem trước
                            </Button>
                        )}
                        <Button
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => { setMenuKey(null); onDownload?.(); }}
                        >
                            <i className="fa-solid fa-download w-4 text-center text-gray-400" />
                            Tải xuống
                        </Button>
                        <Button
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => { setMenuKey(null); onShare?.(); }}
                        >
                            <i className="fa-solid fa-share-nodes w-4 text-center text-gray-400" />
                            Chia sẻ
                        </Button>
                        <div className="mx-4 h-px bg-gray-100" />
                        <Button
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                            onClick={() => { setMenuKey(null); onDelete?.(); }}
                        >
                            <i className="fa-regular fa-trash-can w-4 text-center text-red-400" />
                            Xóa
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

const FolderCard = ({
    folder,
    onOpen,
    onRename,
    onDelete,
    menuKey,
    setMenuKey,
}: {
    folder: FolderResponse;
    onOpen?: () => void;
    onRename?: () => void;
    onDelete?: () => void;
    menuKey: string | null;
    setMenuKey: (k: string | null) => void;
}) => {
    const key = `folder-${folder.uuid}`;
    const [isDragOver, setIsDragOver] = useState<boolean>(false);

    return (
        <div
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData("folder", JSON.stringify(folder));
            }}
            onDragEnter={() => {
                setIsDragOver(true);
            }}
            onDragLeave={() => {
                setIsDragOver(false);
            }}

            onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
            }}
            onDrop={(e) => {
                e.preventDefault();
                const file = JSON.parse(e.dataTransfer.getData("file"));
                const folder = JSON.parse(e.dataTransfer.getData("folder"));

                if (file) {

                }
                else if (folder) {

                }

                setIsDragOver(false);
            }}
            className={`group relative flex flex-col gap-2 rounded-lg border ${isDragOver ? "border-blue-300 bg-blue-100" : "border-gray-100"} p-3 hover:bg-gray-50 transition-colors cursor-pointer select-none`}
            onClick={onOpen}
        >
            {/* <img src={folderIcon} alt="" className="h-10 w-10" /> */}
            <i className="fa-solid fa-folder text-5xl text-gray-600"></i>
            <p className="truncate text-sm font-medium text-gray-800">{folder.name}</p>
            <p className="text-xs text-gray-400">{folder.total_files} tệp · {formatFileSize(folder.total_size)}</p>

            <div className="absolute right-2 top-2" onClick={(e) => e.stopPropagation()}>
                <Button
                    className="invisible rounded p-1 text-gray-400 hover:bg-gray-200 group-hover:visible"
                    onClick={() => setMenuKey(menuKey === key ? null : key)}
                >
                    <i className="fa-solid fa-ellipsis-vertical text-xs" />
                </Button>
                {menuKey === key && (
                    <div className="absolute right-0 top-7 z-20 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                        <Button className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50" onClick={() => { setMenuKey(null); onRename?.(); }}>
                            <i className="fa-regular fa-pen-to-square w-4 text-center text-gray-400" /> Đổi tên
                        </Button>
                        <div className="mx-4 h-px bg-gray-100" />
                        <Button className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50" onClick={() => { setMenuKey(null); onDelete?.(); }}>
                            <i className="fa-regular fa-trash-can w-4 text-center text-red-400" /> Xóa
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};


const FileCard = ({
    file,
    onPreview,
    onShare,
    onDelete,
    onDownload,
    menuKey,
    setMenuKey,
}: {
    file: FileResponse;
    onPreview?: () => void;
    onShare?: () => void;
    onDelete?: () => void;
    onDownload?: () => void;
    menuKey: string | null;
    setMenuKey: (k: string | null) => void;
}) => {
    const key = `file-${file.uuid}`;
    return (
        <div
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData("file", JSON.stringify(file));
            }}
            className="group relative flex flex-col gap-2 rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors select-none"
            onClick={() => isImage(file) && onPreview?.()}
        >
            <img src={getIconForFileType(file.content_type)} draggable={false} alt="File card" className="h-10 w-10" />
            <p className="truncate text-sm font-medium text-gray-800">{file.file_name}</p>
            <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
            {file.is_shared && (
                <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                    Công khai
                </span>
            )}

            <div className="absolute right-2 top-2" onClick={(e) => e.stopPropagation()}>
                <Button
                    className="invisible rounded p-1 text-gray-400 hover:bg-gray-200 group-hover:visible"
                    onClick={() => setMenuKey(menuKey === key ? null : key)}
                >
                    <i className="fa-solid fa-ellipsis-vertical text-xs" />
                </Button>
                {menuKey === key && (
                    <div className="absolute right-0 top-7 z-20 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                        {isImage(file) && (
                            <Button className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50" onClick={() => { setMenuKey(null); onPreview?.(); }}>
                                <i className="fa-regular fa-image w-4 text-center text-gray-400" /> Xem trước
                            </Button>
                        )}
                        <Button className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50" onClick={() => { setMenuKey(null); onDownload?.(); }}>
                            <i className="fa-solid fa-download w-4 text-center text-gray-400" /> Tải xuống
                        </Button>
                        <Button className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50" onClick={() => { setMenuKey(null); onShare?.(); }}>
                            <i className="fa-solid fa-share-nodes w-4 text-center text-gray-400" /> Chia sẻ
                        </Button>
                        <div className="mx-4 h-px bg-gray-100" />
                        <Button className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50" onClick={() => { setMenuKey(null); onDelete?.(); }}>
                            <i className="fa-regular fa-trash-can w-4 text-center text-red-400" /> Xóa
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

const FileExplorer = ({
    files,
    folders,
    viewMode = "list",
    onOpenFolder,
    onRenameFolder,
    onDeleteFolder,
    onShareFile,
    onDeleteFile,
    onDownloadFile,
    onPreviewImage,
}: FileExplorerProps) => {
    const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) setOpenMenuKey(null);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const isEmpty = folders.length === 0 && files.length === 0;

    if (isEmpty) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
                <i className="fa-regular fa-folder-open text-4xl mb-3" />
                <p className="text-sm font-medium">Chưa có file hoặc thư mục</p>
                <p className="mt-1 text-xs">Nhấn "Tải lên" hoặc "Tạo thư mục" để bắt đầu</p>
            </div>
        );
    }

    if (viewMode === "grid") {
        return (
            <div ref={containerRef} className="p-4 space-y-4">
                {folders.length > 0 && (
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Thư mục</p>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                            {folders.map((f) => (
                                <FolderCard
                                    key={f.uuid}
                                    folder={f}
                                    onOpen={() => onOpenFolder?.(f)}
                                    onRename={() => onRenameFolder?.(f)}
                                    onDelete={() => onDeleteFolder?.(f)}
                                    menuKey={openMenuKey}
                                    setMenuKey={setOpenMenuKey}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {files.length > 0 && (
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Tệp</p>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                            {files.map((f) => (
                                <FileCard
                                    key={f.uuid}
                                    file={f}
                                    onPreview={() => onPreviewImage?.(f)}
                                    onShare={() => onShareFile?.(f)}
                                    onDelete={() => onDeleteFile?.(f)}
                                    onDownload={() => onDownloadFile?.(f)}
                                    menuKey={openMenuKey}
                                    setMenuKey={setOpenMenuKey}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div ref={containerRef}>
            <div className="grid grid-cols-[minmax(0,2fr)_140px_120px_90px_2rem] gap-2 border-b border-gray-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                <span>Tên</span>
                <span>Ngày tạo</span>
                <span>Dung lượng</span>
                <span>Số tệp</span>
                <span />
            </div>

            <div className="divide-y divide-gray-100">
                {folders.map((f) => (
                    <FolderRow
                        key={f.uuid}
                        folder={f}
                        onOpen={() => onOpenFolder?.(f)}
                        onRename={() => onRenameFolder?.(f)}
                        onDelete={() => onDeleteFolder?.(f)}
                        menuKey={openMenuKey}
                        setMenuKey={setOpenMenuKey}
                    />
                ))}

                {files.map((f) => (
                    <FileRow
                        key={f.uuid}
                        file={f}
                        onPreview={() => onPreviewImage?.(f)}
                        onShare={() => onShareFile?.(f)}
                        onDelete={() => onDeleteFile?.(f)}
                        onDownload={() => onDownloadFile?.(f)}
                        menuKey={openMenuKey}
                        setMenuKey={setOpenMenuKey}
                    />
                ))}
            </div>
        </div>
    );
};

export default FileExplorer;