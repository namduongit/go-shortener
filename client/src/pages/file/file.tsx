import { useCallback, useEffect, useState } from "react";
import { useExecute } from "../../common/hooks/useExecute";
import { v4 as uuidv4 } from "uuid";
import { useNotificate } from "../../common/hooks/useNotificate";
import { FileModule } from "../../services/modules/file.module";
import { FolderModule } from "../../services/modules/folder.module";
import type { FileListResponse, FileResponse, PresignUploadForm, PresignUploadResponse, SignUploadResponse } from "../../services/types/file.type";
import type { FolderListResponse, FolderResponse } from "../../services/types/folder.type";
import FileExplorer from "../../components/ui/file-page/file-explorer";
import Button from "../../components/ui/button/button";
import CreateFolderModal from "../../components/ui/modal/create-folder/create-folder-modal";
import CreateFileModal from "../../components/ui/modal/create-file/create-file-modal";
import RenameFolderModal from "../../components/ui/modal/rename-folder/rename-folder-modal";
import ShareFileModal from "../../components/ui/modal/share-file/share-file-modal";
import SideFile from "../../components/ui/sidefile/sidefile";
import type { AxiosRequestConfig } from "axios";
import axios from "axios";
import { UploadModule } from "../../services/modules/upload.module";

const FilePage = () => {
    const {
        GetFiles,
        ShareFile, UnshareFile,
        DownloadFile, DeleteFile
    } = FileModule;
    const { GetFolders, CreateFolder, RenameFolder, DeleteFolder } = FolderModule;
    const { PresignUpload, SignUpload, UploadPart, CompeltePart } = UploadModule;

    const { showToast } = useNotificate();

    const [folders, setFolders] = useState<FolderResponse[]>([]);
    const [currentFolder, setCurrentFolder] = useState<FolderResponse | null>(null);
    const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
    const [isRenameFolderModalOpen, setIsRenameFolderModalOpen] = useState(false);
    const [targetRenameFolder, setTargetRenameFolder] = useState<FolderResponse | null>(null);

    const [files, setFiles] = useState<FileResponse[]>([]);
    const [isCreateFileModalOpen, setIsCreateFileModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedShareFile, setSelectedShareFile] = useState<FileResponse | null>(null);
    const [selectedPreviewImage, setSelectedPreviewImage] = useState<FileResponse | null>(null);

    const { execute: executeGetFolders } = useExecute<FolderListResponse>();
    const { execute: executeCreateFolder } = useExecute<FolderResponse>();
    const { execute: executeRenameFolder } = useExecute<FolderResponse>();
    const { execute: executeDeleteFolder } = useExecute<null>();

    const { executeWithDeclareResponse } = useExecute();
    const { execute: executeGetFiles } = useExecute<FileListResponse>();
    const { execute: executeDeleteFile } = useExecute<any>();
    const { execute: executeShareFile, loading: sharingFile } = useExecute<FileResponse>();
    const { execute: executeUnshareFile, loading: unsharingFile } = useExecute<FileResponse>();

    const loadFiles = useCallback(async () => {
        await executeGetFiles(() => GetFiles(), {
            onSuccess: (data) => {
                if (data && Array.isArray(data.files)) {
                    setFiles(data.files);
                    return;
                }
                setFiles([]);
            }
        });
    }, []);

    const loadFolders = useCallback(async () => {
        await executeGetFolders(() => GetFolders(), {
            onSuccess: (data) => {
                if (data && Array.isArray(data.folders)) {
                    setFolders(data.folders);
                    return;
                }
            }
        });
    }, []);

    useEffect(() => {
        void loadFiles();
        void loadFolders();
    }, []);

    const [openMenu, setOpenMenu] = useState<boolean>(false);

    const destinationLabel = currentFolder ? `GMS Cloud > ${currentFolder.name}` : "GMS Cloud";
    const visibleFolders = currentFolder ? [] : folders;
    const visibleFiles = currentFolder
        ? files.filter((file) => file.folder_uuid === currentFolder.uuid)
        : files.filter((file) => !file.folder_uuid);

    const handleCreateFolder = async (folderName: string) => {
        const createdFolder = await executeCreateFolder(() => CreateFolder({ name: folderName }), {
            onSuccess: (data) => {
                if (!data) {
                    return;
                }

                setFolders((previous) => [data, ...previous]);
            }
        });

        return Boolean(createdFolder);
    };

    const handleSignUpload = async (
        dataSet: PresignUploadResponse,
        file: File
    ) => {
        /** Single mode */
        if (dataSet.mode === "single") {
            const sign = await executeWithDeclareResponse<SignUploadResponse>(() => SignUpload(dataSet.session_uuid));
            if (!sign) {
                showToast({
                    type: "error",
                    title: "Upload thất bại",
                    message: `Không thể upload file ${file.name} vào lúc này. Vui lòng thử lại.`,
                });
                return;
            }

            // Upload file to storage with the sign upload url and session id as a header
            const config: AxiosRequestConfig = {
                url: sign.upload_url,
                method: "PUT",
                data: file,
                headers: {
                    "Content-Type": "application/octet-stream",
                }
            }

            const result = await axios.request(config);
            
            if (result.status === 200) {
                // Call complete upload API to complete the upload process
                CompeltePart(dataSet.session_uuid);
            }
        }

        /** Multipart mode */
        if (dataSet.mode === "multipart") {
            // Split file into parts
            const partCount = Math.ceil(file.size / dataSet.part_size);
            const parts: {
                number: number;
                data: Blob
            }[] = [];

            for (let partNumber = 1; partNumber <= partCount; partNumber++) {
                const start = (partNumber - 1) * dataSet.part_size;
                const end = Math.min(start + dataSet.part_size, file.size);
                    parts.push({
                        number: partNumber,
                        data: file.slice(start, end),
                    });
            }

            for (const part of parts) {
                const sign = await executeWithDeclareResponse<SignUploadResponse>(() => SignUpload(dataSet.session_uuid, part.number));
                if (!sign) {
                    showToast({
                        type: "error",
                        title: "Upload thất bại",
                        message: `Không thể upload file ${file.name} vào lúc này. Vui lòng thử lại.`,
                    });
                    return;
                }

                const config: AxiosRequestConfig = {
                    url: sign.upload_url,
                    method: "PUT",
                    data: part.data,
                    headers: {
                        "Content-Type": "application/octet-stream",
                    }
                }

                const result = await axios.request(config);
                if (result.status === 200) {
                    const Etag = (result.headers.Etag || result.headers.etag) as string;

                    const sizeBytes = part.data.size;
                    // Send Etag & Session ID & Part Number to store to complete the part upload
                    await UploadPart(dataSet.session_uuid, part.number, Etag.trim().replace(/"/g, ''), sizeBytes);
                }
            }

            await CompeltePart(dataSet.session_uuid);

        }


    }

    const handleUploadFiles = async (files: File[]) => {
        try {
            // Identify each file with a client_file_id
            const fileMap = new Map<string, File>();
            const metadata = files.map((file) => {

                const client_file_id = uuidv4();
                fileMap.set(client_file_id, file);

                return {
                    client_file_id,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                };
            });
            const presignData: PresignUploadForm = {
                files: metadata
            }

            if (currentFolder) {
                presignData.destination_uuid = currentFolder.uuid;
            }

            // Presign upload to get session ids 
            const presignResponse = await executeWithDeclareResponse<PresignUploadResponse[]>(() => PresignUpload(presignData));

            if (!presignResponse) throw new Error("Presign upload failed");

            presignResponse.forEach(async (item) => {
                if (item.accepted && item.session_uuid) {
                    // Push to client state to show uploading status (Optional)

                    // Call SignUpload to get the upload URL and then upload the file to the URL with the session id as a header
                    handleSignUpload(item, fileMap.get(item.client_file_id)!);
                } else {
                    showToast({
                        type: "error",
                        title: "Không thể upload file",
                        message: `File ${item.client_file_id} không được chấp nhận để upload. Lý do: ${item.reason}`,
                    })
                }
            });

        } catch (error: unknown) {

        }

        setIsCreateFileModalOpen(false);
    };

    const handleOpenRenameFolderModal = (folder: FolderResponse) => {
        setTargetRenameFolder(folder);
        setIsRenameFolderModalOpen(true);
    };

    const handleCloseRenameFolderModal = () => {
        setIsRenameFolderModalOpen(false);
        setTargetRenameFolder(null);
    };

    const handleRenameFolder = async (folderName: string) => {
        if (!targetRenameFolder) {
            return false;
        }

        const renamedFolder = await executeRenameFolder(() => RenameFolder(targetRenameFolder.uuid, folderName), {
            onSuccess: (updated) => {
                if (!updated) {
                    return;
                }

                setFolders((previous) =>
                    previous.map((item) => (item.uuid === targetRenameFolder.uuid ? { ...item, name: updated.name } : item))
                );

                setCurrentFolder((previous) => {
                    if (!previous || previous.uuid !== targetRenameFolder.uuid) {
                        return previous;
                    }

                    return { ...previous, name: updated.name };
                });

                setTargetRenameFolder((previous) => {
                    if (!previous || previous.uuid !== targetRenameFolder.uuid) {
                        return previous;
                    }

                    return { ...previous, name: updated.name };
                });

                showToast({
                    type: "success",
                    title: "Đổi tên thành công",
                    message: `Thư mục đã được đổi tên thành ${updated.name}.`,
                });
            },
            onError: () => {
                showToast({
                    type: "error",
                    title: "Đổi tên thất bại",
                    message: `Không thể đổi tên thư mục ${targetRenameFolder.name}.`,
                });
            }
        });

        return Boolean(renamedFolder);
    };

    const handleDeleteFolder = async (folder: FolderResponse) => {
        const confirmDelete = window.confirm(`Bạn có chắc muốn xóa thư mục ${folder.name}?`);
        if (!confirmDelete) {
            return;
        }

        await executeDeleteFolder(() => DeleteFolder(folder.uuid), {
            onSuccess: () => {
                setFolders((previous) => previous.filter((item) => item.uuid !== folder.uuid));
                if (currentFolder?.uuid === folder.uuid) {
                    setCurrentFolder(null);
                }

                showToast({
                    type: "success",
                    title: "Đã xóa thư mục",
                    message: `Thư mục ${folder.name} đã được xóa.`,
                });
            },
            onError: () => {
                showToast({
                    type: "error",
                    title: "Xóa thư mục thất bại",
                    message: `Không thể xóa thư mục ${folder.name}.`,
                });
            }
        });
    };

    const updateFileShareState = (fileUUID: string, isShared: boolean) => {
        setFiles((previous) =>
            previous.map((file) => (file.uuid === fileUUID ? { ...file, is_shared: isShared } : file))
        );

        setSelectedShareFile((previous) => {
            if (!previous || previous.uuid !== fileUUID) {
                return previous;
            }

            return { ...previous, is_shared: isShared };
        });
    };

    const handleOpenShareModal = (file: FileResponse) => {
        setSelectedShareFile(file);
        setIsShareModalOpen(true);
    };

    const handleCloseShareModal = () => {
        setIsShareModalOpen(false);
        setSelectedShareFile(null);
    };

    const handleShareFile = async (file: FileResponse) => {
        await executeShareFile(() => ShareFile(file.uuid), {
            onSuccess: () => {
                updateFileShareState(file.uuid, true);
                showToast({
                    type: "success",
                    title: "Chia sẻ thành công",
                    message: `File ${file.file_name} đã được bật chia sẻ.`,
                });

                void loadFiles();
            },
            onError: () => {
                showToast({
                    type: "error",
                    title: "Không thể chia sẻ",
                    message: `File ${file.file_name} chưa được chia sẻ.`,
                });
            }
        });
    };

    const handleUnshareFile = async (file: FileResponse) => {
        await executeUnshareFile(() => UnshareFile(file.uuid), {
            onSuccess: () => {
                updateFileShareState(file.uuid, false);
                showToast({
                    type: "success",
                    title: "Đã hủy chia sẻ",
                    message: `File ${file.file_name} đã tắt chia sẻ.`,
                });

                void loadFiles();
            },
            onError: () => {
                showToast({
                    type: "error",
                    title: "Không thể hủy chia sẻ",
                    message: `File ${file.file_name} chưa thể tắt chia sẻ.`,
                });
            }
        });
    };

    const handleCopyShareLink = async () => {
        if (!selectedShareFile || !selectedShareFile.is_shared) {
            showToast({
                type: "warning",
                title: "Chưa bật chia sẻ",
                message: "Hãy bật chia sẻ trước khi copy URL.",
            });
            return;
        }

        const shareUrl = `${import.meta.env.VITE_ENDPOINT_SHARE_FILE}/${selectedShareFile.uuid}`;

        try {
            await navigator.clipboard.writeText(shareUrl);
            showToast({
                type: "success",
                title: "Đã copy URL",
                message: "Liên kết chia sẻ đã được copy vào clipboard.",
            });
        } catch {
            showToast({
                type: "error",
                title: "Copy thất bại",
                message: "Không thể copy URL, vui lòng thử lại.",
            });
        }
    };

    const handleDownloadFile = async (file: FileResponse) => {
        try {
            const blob = await DownloadFile(file.uuid);
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
        await executeDeleteFile(() => DeleteFile(file.uuid), {
            onSuccess: () => {
                setFiles((previous) => previous.filter((item) => item.uuid !== file.uuid));
                setSelectedShareFile((previous) => (previous?.uuid === file.uuid ? null : previous));
                setSelectedPreviewImage((previous) => (previous?.uuid === file.uuid ? null : previous));
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
                    message: `Không thể xóa file ${file.file_name}.`,
                });
            }
        });
    };

    const handlePreviewImage = (file: FileResponse) => {
        if (!file.content_type?.startsWith("image/")) {
            return;
        }

        setSelectedPreviewImage(file);
    };

    const resolveFileFolderName = (file: FileResponse) => {
        if (!file.folder_uuid) {
            return "GMS Cloud";
        }

        const folder = folders.find((item) => item.uuid === file.folder_uuid);
        return folder ? `GMS Cloud > ${folder.name}` : "GMS Cloud";
    };

    useEffect(() => {
        if (!selectedPreviewImage) {
            return;
        }

        const stillExists = visibleFiles.some((file) => file.uuid === selectedPreviewImage.uuid);
        if (!stillExists) {
            setSelectedPreviewImage(null);
        }
    }, [selectedPreviewImage, visibleFiles]);

    return (
        <div className="space-y-4">
            <div className="p-2 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Quản lý File & Folder</h1>
                    <span className="mt-1 block text-sm text-gray-500">Lưu trữ, chia sẻ, quản lý theo phong cách của bạn</span>
                </div>
                <div className="relative">
                    <Button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-sm"
                        onClick={() => setOpenMenu(!openMenu)}
                    >
                        <i className="fa-regular fa-calendar-plus"></i>
                        Tạo mới
                    </Button>

                    {openMenu && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-md shadow z-10">
                            <Button
                                className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                    setIsCreateFolderModalOpen(true);
                                    setOpenMenu(false);
                                }}
                            >
                                <i className="fa-solid fa-folder-plus"></i>
                                Thư mục mới
                            </Button>
                            <Button
                                className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                    setIsCreateFileModalOpen(true);
                                    setOpenMenu(false);
                                }}
                            >
                                <i className="fa-solid fa-upload"></i>
                                Tải file lên
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Button
                        className={`rounded px-2 py-1 font-semibold ${currentFolder ? "text-[#1a73e8] hover:bg-[#e8f0fe]" : "text-gray-900"}`}
                        onClick={() => setCurrentFolder(null)}
                        disabled={!currentFolder}
                    >
                        GMS
                    </Button>
                    {currentFolder && (
                        <>
                            <span className="text-gray-400">&gt;</span>
                            <span className="font-semibold text-gray-900">{currentFolder.name}</span>
                        </>
                    )}
                </div>
                {currentFolder && (
                    <Button
                        className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setCurrentFolder(null)}
                    >
                        <i className="fa-solid fa-arrow-left mr-2"></i>
                        Back
                    </Button>
                )}
            </div>

            <div className={`grid gap-4 ${selectedPreviewImage ? "lg:grid-cols-[minmax(0,1fr)_20rem]" : "grid-cols-1"}`}>
                <div>
                    <div className="flex border-b border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-600">
                        <div className="flex flex-3 items-center gap-2">
                            <i className="fa-solid fa-list-ul text-xs"></i>
                            Tên
                        </div>
                        <div className="flex-1">Ngày tạo</div>
                        <div className="flex-1">Kích thước</div>
                        <div className="flex-1 text-end">Hành động</div>
                    </div>

                    <FileExplorer
                        files={visibleFiles}
                        folders={visibleFolders}
                        onOpenFolder={setCurrentFolder}
                        onRenameFolder={handleOpenRenameFolderModal}
                        onDeleteFolder={(folder) => void handleDeleteFolder(folder)}
                        onShareFile={handleOpenShareModal}
                        onDownloadFile={(file) => void handleDownloadFile(file)}
                        onDeleteFile={(file) => void handleDeleteFile(file)}
                        onPreviewImage={handlePreviewImage}
                    />
                </div>

                {selectedPreviewImage && (
                    <SideFile
                        file={selectedPreviewImage}
                        onClose={() => setSelectedPreviewImage(null)}
                        onFileDeleted={() => {
                            setFiles((previous) => previous.filter((item) => item.uuid !== selectedPreviewImage.uuid));
                            setSelectedPreviewImage(null);
                        }}
                        resolveFileFolderName={resolveFileFolderName}
                    />
                )}
            </div>

            <CreateFolderModal
                isOpen={isCreateFolderModalOpen}
                onClose={() => setIsCreateFolderModalOpen(false)}
                onSubmit={handleCreateFolder}
            />

            <CreateFileModal
                isOpen={isCreateFileModalOpen}
                onClose={() => setIsCreateFileModalOpen(false)}
                onSubmit={handleUploadFiles}
                destinationLabel={destinationLabel}
            />

            <RenameFolderModal
                isOpen={isRenameFolderModalOpen}
                initialName={targetRenameFolder?.name ?? ""}
                onClose={handleCloseRenameFolderModal}
                onSubmit={handleRenameFolder}
            />

            <ShareFileModal
                isOpen={isShareModalOpen}
                file={selectedShareFile}
                onClose={handleCloseShareModal}
                onCopyLink={() => void handleCopyShareLink()}
                onShare={handleShareFile}
                onUnshare={handleUnshareFile}
                processing={sharingFile || unsharingFile}
            />
        </div>
    );
}

export default FilePage;