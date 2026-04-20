import { useEffect, useRef, useState } from "react";
import type { FileResponse } from "../../../services/types/file.type";
import type { FolderResponse } from "../../../services/types/folder.type";
import { formatDriveDate } from "../../../services/utils/date";
import { formatFileSize, getIconForFileType } from "../../../services/utils/file";
import folderIcon from "../../../assets/icons/folder-icon.png";
import Button from "../button/button";

type FileExplorerProps = {
    files: FileResponse[];
    folders: FolderResponse[];
    onOpenFolder?: (folder: FolderResponse) => void;
    onRenameFolder?: (folder: FolderResponse) => void;
    onDeleteFolder?: (folder: FolderResponse) => void;
    onShareFile?: (file: FileResponse) => void;
    onDownloadFile?: (file: FileResponse) => void;
    onDeleteFile?: (file: FileResponse) => void;
    onPreviewImage?: (file: FileResponse) => void;
}

const FileExplorer = ({
    files,
    folders,
    onOpenFolder,
    onRenameFolder,
    onDeleteFolder,
    onShareFile,
    onDownloadFile,
    onDeleteFile,
    onPreviewImage,
}: FileExplorerProps) => {
    const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
    const menuContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (!menuContainerRef.current) {
                return;
            }

            if (!menuContainerRef.current.contains(event.target as Node)) {
                setOpenMenuKey(null);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    return (
        <div className="divide-y divide-gray-100" ref={menuContainerRef}>
            {folders.map((folder) => (
                <div
                    key={folder.uuid}
                    className={`flex items-center px-4 py-3 text-sm hover:bg-gray-50 ${onOpenFolder ? "cursor-pointer" : ""}`}
                    onClick={() => onOpenFolder?.(folder)}
                >
                    <div className="flex-3 flex items-center gap-3 font-medium text-gray-800">
                        <img
                            src={folderIcon}
                            alt={folder.name}
                            className="h-6 w-6" />
                        {folder.name}
                    </div>
                    <div className="flex-1 text-gray-500">{formatDriveDate(folder.created_at)}</div>
                    <div className="flex-1 text-gray-400">--</div>
                    <div className="relative flex-1 text-end">
                        <Button
                            className="px-2 py-1 text-gray-500 hover:text-gray-700"
                            onClick={(event) => {
                                event.stopPropagation();
                                setOpenMenuKey(openMenuKey === `folder-${folder.uuid}` ? null : `folder-${folder.uuid}`);
                            }}
                        >
                            <i className="fa-solid fa-ellipsis-vertical"></i>
                        </Button>

                        {openMenuKey === `folder-${folder.uuid}` && (
                            <div className="absolute right-0 top-8 z-10 w-44 bg-white p-1 shadow-lg">
                                <Button
                                    type="button"
                                    className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setOpenMenuKey(null);
                                        onRenameFolder?.(folder);
                                    }}
                                >
                                    Sửa tên thư mục
                                </Button>
                                <Button
                                    type="button"
                                    className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setOpenMenuKey(null);
                                        onDeleteFolder?.(folder);
                                    }}
                                >
                                    Xóa thư mục
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {files.map((file) => (
                <div
                    key={file.uuid}
                    className="flex items-center px-4 py-3 text-sm hover:bg-gray-50"
                    onClick={() => {
                        if (file.content_type?.startsWith("image/")) {
                            onPreviewImage?.(file);
                        }
                    }}
                >
                    <div className="flex-3 flex items-center gap-3 font-medium text-gray-800">
                        <img
                            src={getIconForFileType(file.content_type)}
                            alt={file.file_type}
                            className="h-6 w-5" />
                        <span className="truncate">{file.file_name}</span>
                        {file.is_shared && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                <i className="fa-solid fa-link text-[10px]"></i>
                                Đang chia sẻ
                            </span>
                        )}
                    </div>
                    <div className="flex-1 text-gray-500">{formatDriveDate(file.uploaded_at)}</div>
                    <div className="flex-1 text-gray-500">{formatFileSize(file.size)}</div>
                    <div className="relative flex-1 text-end">
                        <Button
                            className="px-2 py-1 text-gray-500 hover:text-gray-700"
                            onClick={(event) => {
                                event.stopPropagation();
                                setOpenMenuKey(openMenuKey === `file-${file.uuid}` ? null : `file-${file.uuid}`);
                            }}
                        >
                            <i className="fa-solid fa-ellipsis-vertical"></i>
                        </Button>

                        {openMenuKey === `file-${file.uuid}` && (
                            <div className="absolute right-0 top-8 z-10 w-48 bg-white p-1 shadow-lg">
                                <Button
                                    className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => {
                                        setOpenMenuKey(null);
                                        onShareFile?.(file);
                                    }}
                                >   
                                    <i className="fa-solid fa-share-nodes"></i>
                                    Chia sẻ
                                </Button>
                                <Button
                                    className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => {
                                        setOpenMenuKey(null);
                                        onDownloadFile?.(file);
                                    }}
                                >
                                    <i className="fa-solid fa-download"></i>
                                    Tải xuống
                                </Button>
                                <Button
                                    className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                    onClick={() => {
                                        setOpenMenuKey(null);
                                        onDeleteFile?.(file);
                                    }}
                                >
                                    <i className="fa-solid fa-trash"></i>
                                    Xóa
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default FileExplorer;