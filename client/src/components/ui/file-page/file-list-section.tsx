import type { FileResponse } from "../../../services/types/file.type";
import type { FolderResponse } from "../../../services/types/folder.type";
import FileExplorer, { type ViewMode } from "./file-explorer";
import Button from "../button/button";

interface FileListSectionProps {
    files: FileResponse[];
    folders: FolderResponse[];
    loading: boolean;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    onOpenFolder: (folder: FolderResponse) => void;
    onRenameFolder: (folder: FolderResponse) => void;
    onDeleteFolder?: (folder: FolderResponse) => void;
    onShareFile: (file: FileResponse) => void;
    onDeleteFile?: (file: FileResponse) => void;
    onDownloadFile?: (file: FileResponse) => void;
    onPreviewImage: (file: FileResponse) => void;
}

const FileListSection = ({
    files,
    folders,
    loading,
    viewMode,
    onViewModeChange,
    onOpenFolder,
    onRenameFolder,
    onDeleteFolder,
    onShareFile,
    onDeleteFile,
    onDownloadFile,
    onPreviewImage,
}: FileListSectionProps) => {

    return (
        <div className="bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
                <p className="text-xs text-gray-400">
                    {loading ? "Đang tải…" : `${folders.length} thư mục · ${files.length} tệp`}
                </p>
                <div className="flex items-center gap-0.5">
                    <Button
                        title="Danh sách"
                        className={`rounded p-1.5 text-sm transition-colors ${viewMode === "list"
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            }`}
                        onClick={() => onViewModeChange("list")}
                    >
                        <i className="fa-solid fa-list" />
                    </Button>
                    <Button
                        title="Lưới"
                        className={`rounded p-1.5 text-sm transition-colors ${viewMode === "grid"
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            }`}
                        onClick={() => onViewModeChange("grid")}
                    >
                        <i className="fa-solid fa-grip" />
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex h-52 items-center justify-center">
                    <div className="text-center text-gray-400">
                        <i className="fa-solid fa-spinner fa-spin mb-2 block text-2xl" />
                        <p className="text-sm">Đang tải…</p>
                    </div>
                </div>
            ) : (
                <FileExplorer
                    files={files}
                    folders={folders}
                    viewMode={viewMode}
                    onOpenFolder={onOpenFolder}
                    onRenameFolder={onRenameFolder}
                    onDeleteFolder={onDeleteFolder}
                    onShareFile={onShareFile}
                    onDeleteFile={onDeleteFile}
                    onDownloadFile={onDownloadFile}
                    onPreviewImage={onPreviewImage}
                />
            )}
        </div>
    );
};

export default FileListSection;
