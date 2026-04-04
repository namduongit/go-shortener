import { createContext, useCallback, useEffect, useState } from "react";
import { AuthModule } from "../../services/modules/auth.module";
import { useExecute } from "../hooks/useExecute";
import type { ConfigResponse, LoginResponse, RegisterResponse } from "../../services/types/auth.type";

type AuthState = LoginResponse | RegisterResponse;
interface AuthenticateContexType {
    state: AuthState;
    saveState: (state: AuthState) => void;
    authConfig: boolean;
    checkingAuth: boolean;
}

const AuthenticateContext = createContext<AuthenticateContexType | undefined>(undefined);

const AuthenticateProvider = ({ children }: { children: React.ReactNode }) => {
    const { Config } = AuthModule;

    const [state, setState] = useState<AuthState>({ email: "", role: "", plan_name: "" });

    const [authConfig, setAuthConfig] = useState<boolean>(false);
    const [initialized, setInitialized] = useState<boolean>(false);
    const { loading, execute } = useExecute<ConfigResponse>();

    const saveState = (state: AuthState) => {
        localStorage.setItem("GO_ACCOUNT", JSON.stringify(state));
        setAuthConfig(true);
    }

    const validateSession = useCallback(async () => {
        const local = localStorage.getItem("GO_ACCOUNT");
        if (local) {
            const parsed: AuthState = JSON.parse(local);
            if (parsed) {
                if (!parsed.email || !parsed.role || !parsed.plan_name) {
                    void AuthModule.Logout();
                    setAuthConfig(false);
                    localStorage.removeItem("GO_ACCOUNT");
                    return false;
                }

                await execute(() => Config(), {
                    onSuccess: (config: ConfigResponse) => {
                       setState(parsed);
                       setAuthConfig(config.is_authenticated);
                    },
                    onError: () => {
                        setAuthConfig(false);
                        localStorage.removeItem("GO_ACCOUNT");
                        void AuthModule.Logout();
                    }
                });

                return false;
            }
        }

        setAuthConfig(false);
        setInitialized(true);
        return false;

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
        <AuthenticateContext.Provider value={{ state, saveState, authConfig, checkingAuth: !initialized || loading }}>
            {children}
        </AuthenticateContext.Provider>
    );
}

export { AuthenticateContext };

export default AuthenticateProvider;
