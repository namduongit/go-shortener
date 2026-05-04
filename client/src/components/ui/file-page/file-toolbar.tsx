import { useState } from "react";
import type { FolderResponse } from "../../../services/types/folder.type";
import Button from "../button/button";

interface FileToolbarProps {
    currentFolderPath: FolderResponse[];
    onNavigateToRoot: () => void;
    onNavigateToFolder: (folder: FolderResponse) => void;
    onCreateFolder: () => void;
    onUploadFiles: () => void;
}

const FileToolbar = ({
    currentFolderPath,
    onNavigateToRoot,
    onNavigateToFolder,
    onCreateFolder,
    onUploadFiles,
}: FileToolbarProps) => {
    const [openMenu, setOpenMenu] = useState(false);

    const currentFolder = currentFolderPath[currentFolderPath.length - 1];

    return (
        <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
                <nav className="flex items-center gap-1 text-sm text-gray-500">
                    <Button
                        className={`rounded px-1 py-0.5 font-medium transition-colors ${currentFolderPath.length === 0
                                ? "text-gray-900 cursor-default"
                                : "hover:bg-gray-100 hover:text-gray-900"
                            }`}
                        onClick={onNavigateToRoot}
                        disabled={currentFolderPath.length === 0}
                    >
                        GMS Cloud
                    </Button>

                    {currentFolderPath.map((folder) => (
                        <span key={folder.uuid} className="flex items-center gap-1">
                            <i className="fa-solid fa-chevron-right text-[10px] text-gray-300" />
                            <Button
                                className="rounded px-1 py-0.5 font-medium text-gray-900 hover:bg-gray-100 transition-colors"
                                onClick={() => onNavigateToFolder(folder)}
                            >
                                {folder.name}
                            </Button>
                        </span>
                    ))}
                </nav>

                <h1 className="mt-0.5 text-xl font-semibold text-gray-900">
                    {currentFolder ? currentFolder.name : "Tệp của tôi"}
                </h1>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                {currentFolderPath.length > 0 && (
                    <Button
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={onNavigateToRoot}
                    >
                        <i className="fa-solid fa-arrow-left text-xs" />
                        <span className="hidden sm:inline">Quay lại</span>
                    </Button>
                )}

                <div className="relative">
                    <Button
                        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setOpenMenu((v) => !v)}
                    >
                        <i className="fa-solid fa-plus text-xs" />
                        Tạo mới
                    </Button>

                    {openMenu && (
                        <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                            <Button
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={() => { onCreateFolder(); setOpenMenu(false); }}
                            >
                                <i className="fa-regular fa-folder text-gray-400" />
                                Thư mục mới
                            </Button>
                            <Button
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={() => { onUploadFiles(); setOpenMenu(false); }}
                            >
                                <i className="fa-solid fa-arrow-up-from-bracket text-gray-400" />
                                Tải file lên
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileToolbar;
