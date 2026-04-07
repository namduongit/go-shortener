import { createContext, useCallback, useEffect, useRef, useState } from "react";

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

const TOAST_DURATION = 4000;

const toastPalette: Record<ToastOptions["type"], { accent: string; surface: string; border: string }> = {
    info: { accent: "#1a73e8", surface: "#f8fbff", border: "#d9e1ef" },
    success: { accent: "#188038", surface: "#f3faf4", border: "#d7eadb" },
    warning: { accent: "#b26a00", surface: "#fffaf0", border: "#f1e0bf" },
    error: { accent: "#d93025", surface: "#fef6f5", border: "#f2d2cf" },
};

interface NotificateContextType {
    showToast: (toast: ToastOptions) => void;
    showAlert: () => void;
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

    const showAlert = () => {

    }

    const showConfirm = () => {

    }

    /** Init value to test */
    useEffect(() => {
        // showToast({ type: "success", title: "Thành công", message: "Đăng nhập thành công!" });
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
                return "×";
            default:
                return "";
        }
    };

    return (
        <NotificateContext.Provider value={{ showToast, showAlert, showConfirm }}>
            <div
                className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(100%-2rem,22rem)] flex-col gap-3"
                aria-live="polite"
                aria-atomic="true"
            >
                {toasts.map((toast) => {
                    const { accent, surface, border } = toastPalette[toast.options.type];

                    return (
                        <article
                            key={toast.id}
                            className="pointer-events-auto flex items-center gap-4 rounded-2xl border px-4 py-3 shadow-[0_12px_30px_rgba(34,61,102,0.12)]"
                            style={{ backgroundColor: surface, borderColor: border }}
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
                            <button
                                type="button"
                                className="mt-0.5 rounded-full px-2 py-1 text-base font-semibold text-gray-500 transition hover:bg-white/70 hover:text-gray-900"
                                onClick={() => dismissToast(toast.id)}
                            >
                                ×
                            </button>
                        </article>
                    );
                })}
            </div>

            {children}
        </NotificateContext.Provider>
    );
}

export { NotificateContext };

export default NotificateProvider;