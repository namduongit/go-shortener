import { createContext, useCallback, useEffect, useState } from "react";
import { AuthModule } from "../../services/modules/auth.module";
import { useExecute } from "../hooks/useExecute";
import type { ConfigResponse, LoginResponse, RegisterResponse } from "../../services/types/auth.type";

type AuthState = LoginResponse | RegisterResponse;
interface AuthenticateContexType {
    state: AuthState | undefined;
    saveState: (state: AuthState) => void;
    clearState: () => void;
    authConfig: boolean;
    checkingAuth: boolean;
}

const AuthenticateContext = createContext<AuthenticateContexType | undefined>(undefined);

const AuthenticateProvider = ({ children }: { children: React.ReactNode }) => {
    const { Config, Logout } = AuthModule;

    const [state, setState] = useState<AuthState | undefined>(undefined);

    const [authConfig, setAuthConfig] = useState<boolean>(false);
    const [initialized, setInitialized] = useState<boolean>(false);
    const { loading, execute } = useExecute<ConfigResponse>();

    const saveState = (state: AuthState) => {
        localStorage.setItem("GO_ACCOUNT", JSON.stringify(state));
        setState(state);
        setAuthConfig(true);
    }

    const clearState = () => {
        localStorage.removeItem("GO_ACCOUNT");
        setState(undefined);
        setAuthConfig(false);
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
                // Check if session is still valid
                await execute(() => Config(), {
                    onSuccess: () => {
                        setState(parsed);
                        setAuthConfig(true);
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
        <AuthenticateContext.Provider value={{ state, saveState, clearState, authConfig, checkingAuth: !initialized || loading }}>
            {children}
        </AuthenticateContext.Provider>
    );
}

export { AuthenticateContext };

export default AuthenticateProvider;
