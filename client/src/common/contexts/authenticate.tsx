import { createContext, useCallback, useEffect, useState } from "react";
import { AuthModule } from "../../services/modules/auth.module";
import { useExecute } from "../hooks/useExecute";
import type { AuthConfigResponse, LoginResponse, RegisterResponse } from "../../services/types/auth.type";

type AuthState = LoginResponse | RegisterResponse;

type UploadFileProcess = {
    id: string;
    name: string;
    numberOfProcessed: number;
    total: number;
}
interface AuthenticateContexType {
    // State account. After login or register
    state: AuthState | undefined;
    // Run when reload page and check if session is still valid -> this is response
    authConfig: AuthConfigResponse | undefined;

    saveState: (state: AuthState) => void;
    clearState: () => void;

    // Loading when checking session
    initialized: boolean;

    // File upload state
    fileProcesses: UploadFileProcess[];
    addProcess: (process: UploadFileProcess) => void;
    updateNumberOfProcessed: (id: string, numberOfProcessed: number) => void;
    removeProcess: (id: string) => void;
}

const AuthenticateContext = createContext<AuthenticateContexType | undefined>(undefined);

const AuthenticateProvider = ({ children }: { children: React.ReactNode }) => {
    const { execute } = useExecute<AuthConfigResponse>();
    const { Config, Logout } = AuthModule;

    const [state, setState] = useState<AuthState | undefined>(undefined);
    const [authConfig, setAuthConfig] = useState<AuthConfigResponse | undefined>(undefined);
    const [initialized, setInitialized] = useState(false);

    // File upload state -> Show progress bar and disable some actions when uploading
    const [fileProcesses, setFileProcesses] = useState<UploadFileProcess[]>([]);

    const saveState = (state: AuthState) => {
        localStorage.setItem("GO_ACCOUNT", JSON.stringify(state));
        setState(state);
        // After login or register, we don't have config yet, so set to undefined
        // If reload, authConfig will be fetched and set to correct value
        setAuthConfig(undefined);
    }

    const clearState = () => {
        localStorage.removeItem("GO_ACCOUNT");
        setState(undefined);
        setAuthConfig(undefined);
    };

    const validateSession = useCallback(async () => {
        const local = localStorage.getItem("GO_ACCOUNT");
        if (local) {
            let parsed: AuthState;
            try {
                parsed = JSON.parse(local) as AuthState;
            } catch {
                clearState();
                return;
            }

            if (parsed.uuid && parsed.email && parsed.plan) {
                await execute(() => Config(), {
                    onSuccess: (data: AuthConfigResponse) => {
                        setState(parsed);
                        setAuthConfig(data);
                    },
                    onError: async () => {
                        await Logout();
                        clearState();
                    }
                })
            }
        }

        setInitialized(true);
    }, []);

    const addProcess = (process: UploadFileProcess) => {
        setFileProcesses((prev) => [...prev, process]);
    }

    const updateNumberOfProcessed = (id: string, numberOfProcessed: number) => {
        setFileProcesses((prev) =>
            prev.map((process) =>
                process.id === id ? { ...process, numberOfProcessed } : process
            )
        );
    }

    const removeProcess = (id: string) => {
        setFileProcesses((prev) => prev.filter((process) => process.id !== id));
    }

    useEffect(() => {
        const bootstrapSession = async () => {
            try {
                await validateSession();
            } finally {
                setInitialized(true);
            }
        };

        void bootstrapSession();
    }, [validateSession]);

    return (
        <AuthenticateContext.Provider value={{ state, authConfig, saveState, clearState, initialized, fileProcesses, addProcess, updateNumberOfProcessed, removeProcess }}>
            {children}
        </AuthenticateContext.Provider>
    );
}

export { AuthenticateContext };

export default AuthenticateProvider;
