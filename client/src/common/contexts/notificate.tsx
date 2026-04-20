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
    showConfirm: () => void;
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

    const [confirmContent, setConfirmContent] = useState<AlertOptions | null>(null);
    const confirmResolveRef = useRef<((value: boolean) => void) | null>(null);
    const showConfirm = (): Promise<boolean> => {
        return new Promise((resolve) => {
            setConfirmContent({
                title: "Xác nhận hành động",
                message: "Bạn có chắc chắn muốn thực hiện hành động này?"
            });
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

    /** Init value to test */
    useEffect(() => {
        // showToast({ type: "success", title: "Thành công", message: "Đăng nhập thành công!" });
        // showAlert({ title: "Thông báo", message: "Đây là một thông báo quan trọng!" });
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
        <NotificateContext.Provider value={{ showToast, showAlert, showConfirm }}>
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
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
            </div>

            {children}
        </NotificateContext.Provider>
    );
}

export { NotificateContext };

export default NotificateProvider;