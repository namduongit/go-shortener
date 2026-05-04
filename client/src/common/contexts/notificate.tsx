import { createContext, useCallback, useEffect, useRef, useState } from "react";
import Button from "../../components/ui/button/button";

type ToastOptions = {
    type: "info" | "success" | "warning" | "error";
    title: string;
    message: string;
}

type Toast = {
    id: string;
    options: ToastOptions;
    expiresAt: number;
}

type AlertOptions = {
    title: string;
    message: string;
}

type ConfirmOptions = {
    title: string;
    message: string;
}

type FileConflictOptions = {
    files: string[];
}

/**
 * 1 = Override files,
 * 2 = Keep original files,
 * 3 = Cancel/Exit
**/
type FileConflictResult = 1 | 2 | 3;

const TOAST_DURATION = 4000;

const toastPalette: Record<ToastOptions["type"], { accent: string; surface: string; border: string }> = {
    info: { accent: "#1a73e8", surface: "#f8fbff", border: "#d9e1ef" },
    success: { accent: "#188038", surface: "#f3faf4", border: "#d7eadb" },
    warning: { accent: "#b26a00", surface: "#fffaf0", border: "#f1e0bf" },
    error: { accent: "#d93025", surface: "#fef6f5", border: "#f2d2cf" },
};

interface NotificateContextType {
    showToast: (toast: ToastOptions) => void;
    showAlert: (alert: AlertOptions) => Promise<void>;
    showConfirm: (confirm: ConfirmOptions) => Promise<boolean>;
    showFileConflict: (options: FileConflictOptions) => Promise<FileConflictResult>;
}

const NotificateContext = createContext<NotificateContextType | undefined>(undefined);

const NotificateProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timersRef = useRef<Record<string, number>>({});

    const dismissToast = useCallback((id: string) => {
        const timeoutId = timersRef.current[id];
        if (timeoutId) {
            window.clearTimeout(timeoutId);
            delete timersRef.current[id];
        }

        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((toast: ToastOptions) => {
        const id = crypto.randomUUID?.() ?? Date.now().toString();
        const expiresAt = Date.now() + TOAST_DURATION;

        setToasts((prev) => [...prev, { id, options: toast, expiresAt }]);

        timersRef.current[id] = window.setTimeout(() => {
            dismissToast(id);
        }, TOAST_DURATION);
    }, [dismissToast]);

    // Alert dialog
    const [alertContent, setAlertContent] = useState<AlertOptions | null>(null);
    const resolveRef = useRef<(value: void) => void | null>(null);
    const showAlert = (alert: AlertOptions): Promise<void> => {
        return new Promise((resolve) => {
            setAlertContent(alert); // Cập nhật nội dung cần hiển thị
            resolveRef.current = resolve; // Lưu resolve vào ref để gọi khi đóng alert
        });
    };

    const dismissAlert = () => {
        if (resolveRef.current) {
            resolveRef.current(); // Call resolve  when alert is dismissed
        }
        resolveRef.current = null; // Reset ref
        setAlertContent(null); // Ẩn alert
    };

    // Confirm dialog
    const [confirmContent, setConfirmContent] = useState<ConfirmOptions | null>(null);
    const confirmResolveRef = useRef<((value: boolean) => void) | null>(null);
    const showConfirm = (confirm: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setConfirmContent(confirm);
            confirmResolveRef.current = resolve;
        });
    }

    const dismissConfirm = (result: boolean) => {
        if (confirmResolveRef.current) {
            confirmResolveRef.current(result);
        }
        confirmResolveRef.current = null;
        setConfirmContent(null);
    }

    // File Conflict dialog
    const [fileConflictContent, setFileConflictContent] = useState<FileConflictOptions | null>(null);
    const [fileConflictChoice, setFileConflictChoice] = useState<1 | 2 | null>(null);
    const fileConflictResolveRef = useRef<((value: FileConflictResult) => void) | null>(null);

    const showFileConflict = (options: FileConflictOptions): Promise<FileConflictResult> => {
        return new Promise((resolve) => {
            setFileConflictContent(options);
            setFileConflictChoice(null);
            fileConflictResolveRef.current = resolve;
        });
    };

    const dismissFileConflict = (result: FileConflictResult) => {
        if (fileConflictResolveRef.current) {
            fileConflictResolveRef.current(result);
        }
        fileConflictResolveRef.current = null;
        setFileConflictContent(null);
        setFileConflictChoice(null);
    };

    /** Init value to test */
    useEffect(() => {
        // showToast({ type: "success", title: "Thành công", message: "Đăng nhập thành công!" });
        // showAlert({ title: "Thông báo", message: "Đây là một thông báo quan trọng!" });
        // const a = async () => {
        //     const res = await showConfirm({ title: "Thông báo", message: "Đây là một thông báo quan trọng!" });
        //     console.log(res);
        // }
        // a();
        // const b = async () => {
        //     const res = await showFileConflict({ files: ["File 1", "File 2", "File 3"] });
        //     console.log(res); // 1 | 2 | 3
        // };
        // b();
    }, []);

    useEffect(() => {
        return () => {
            Object.values(timersRef.current).forEach((timeoutId) => window.clearTimeout(timeoutId));
        };
    }, []);

    const getToastIconLabel = (type: ToastOptions["type"]) => {
        switch (type) {
            case "info":
                return "i";
            case "success":
                return "✓";
            case "warning":
                return "!";
            case "error":
                return "x";
            default:
                return "";
        }
    };

    return (
        <NotificateContext.Provider value={{ showToast, showAlert, showConfirm, showFileConflict }}>
            <div
                className="z-100"
            >
                {/* Toasts */}
                <div className="fixed top-4 right-4 z-50 flex w-full max-w-sm flex-col gap-3">
                    {toasts.map((toast, idx) => {
                        const { accent, surface, border } = toastPalette[toast.options.type];

                        return (
                            <article
                                key={toast.id}
                                className="toast pointer-events-auto flex items-center gap-4 rounded-xl border px-4 py-3 shadow-[0_12px_30px_rgba(34,61,102,0.12)]"
                                style={{ backgroundColor: surface, borderColor: border, animationDelay: `${idx * 0.1}s` }}
                                aria-live="assertive"
                            >
                                <div
                                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold"
                                    style={{ backgroundColor: accent, color: "white" }}
                                >
                                    {getToastIconLabel(toast.options.type)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-gray-900">{toast.options.title}</p>
                                    <p className="mt-1 text-sm leading-5 text-gray-500">{toast.options.message}</p>
                                </div>
                                <Button
                                    type="button"
                                    className="mt-0.5 rounded-full px-2 py-1 text-base font-semibold text-gray-500 transition hover:bg-white/70 hover:text-gray-900"
                                    onClick={() => dismissToast(toast.id)}
                                >
                                    x
                                </Button>
                            </article>
                        );
                    })}
                </div>

                {/* Alert */}
                {alertContent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                        <div className="w-full max-w-md rounded-lg bg-white p-4">
                            <h2 className="text-xl font-semibold text-gray-900">{alertContent.title}</h2>
                            <p className="mt-4 text-sm text-gray-700">{alertContent.message}</p>
                            <div className="mt-6 flex justify-end">
                                <Button
                                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
                                    onClick={dismissAlert}>Đồng ý</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirm */}
                {confirmContent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="w-full max-w-md rounded-lg bg-white shadow-lg overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                <h2 className="text-sm font-semibold text-gray-900">{confirmContent.title}</h2>
                                <Button
                                    className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-lg leading-none"
                                    onClick={() => dismissConfirm(false)}
                                >
                                    x
                                </Button>
                            </div>
                            <div className="px-5 py-4">
                                <p className="text-sm text-gray-500">{confirmContent.message}</p>
                            </div>
                            <div className="px-5 py-3 flex justify-end gap-2 border-t border-gray-100">
                                <Button
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                                    onClick={() => dismissConfirm(false)}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                    onClick={() => dismissConfirm(true)}
                                >
                                    Đồng ý
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* File Conflict */}
                {fileConflictContent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="w-full max-w-lg rounded-lg bg-white shadow-lg overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                <h2 className="text-sm font-semibold text-gray-900">Phát hiện file đã tồn tại</h2>
                                <Button
                                    className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-lg leading-none"
                                    onClick={() => dismissFileConflict(3)}
                                >
                                    x
                                </Button>
                            </div>

                            {/* Body */}
                            <div className="px-5 py-4 flex flex-col gap-3">
                                <p className="text-sm text-gray-500">
                                    Một vài file đã tồn tại trong thư mục này. Bạn muốn xử lý như thế nào?
                                </p>

                                {/* File list */}
                                <ul className="max-h-32 overflow-y-auto rounded-md border border-gray-100 bg-gray-50 px-3 py-2 flex flex-col gap-1">
                                    {fileConflictContent.files.map((file, i) => (
                                        <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                                            <span className="text-gray-400">
                                                <i className="fa-solid fa-file"></i>
                                            </span>
                                            <span className="truncate">{file}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Options */}
                                <div className="flex flex-col gap-2 mt-1">
                                    <label
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${fileConflictChoice === 1
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 hover:bg-gray-50"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="file-conflict"
                                            className="accent-blue-600"
                                            checked={fileConflictChoice === 1}
                                            onChange={() => setFileConflictChoice(1)}
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">Ghi đè</p>
                                            <p className="text-xs text-gray-400">Thay thế các file hiện có bằng file mới</p>
                                        </div>
                                    </label>

                                    <label
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${fileConflictChoice === 2
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 hover:bg-gray-50"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="file-conflict"
                                            className="accent-blue-600"
                                            checked={fileConflictChoice === 2}
                                            onChange={() => setFileConflictChoice(2)}
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">Giữ nguyên</p>
                                            <p className="text-xs text-gray-400">Bỏ qua các file trùng, không tải lên</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-5 py-3 flex justify-end gap-2 border-t border-gray-100">
                                <Button
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                                    onClick={() => dismissFileConflict(3)}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${fileConflictChoice !== null
                                        ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                                        : "bg-blue-300 cursor-not-allowed"
                                        }`}
                                    onClick={() => {
                                        if (fileConflictChoice !== null) {
                                            dismissFileConflict(fileConflictChoice);
                                        }
                                    }}
                                >
                                    Đồng ý
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {children}
        </NotificateContext.Provider>
    );
}

export { NotificateContext };

export default NotificateProvider;