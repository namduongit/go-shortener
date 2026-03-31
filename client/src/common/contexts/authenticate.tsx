import { createContext, useCallback, useEffect, useState } from "react";
import { AuthModule } from "../../services/modules/auth.module";
import { useExecute } from "../hooks/useExecute";
import type { ConfigResponse, LoginResponse } from "../../services/types/auth.type";

interface AuthenticateContexType {
    saveState: (state: LoginResponse) => void;
    authConfig: boolean;
    checkingAuth: boolean;
}

const AuthenticateContext = createContext<AuthenticateContexType | undefined>(undefined);

const AuthenticateProvider = ({ children }: { children: React.ReactNode }) => {
    const { Config } = AuthModule;
    const [authConfig, setAuthConfig] = useState<boolean>(false);
    const { loading, execute } = useExecute<ConfigResponse>();

    const saveState = (state: LoginResponse) => {
        localStorage.setItem("GO_ACCOUNT", JSON.stringify(state));
        setAuthConfig(true);
    }

    const validateSession = useCallback(async () => {
        const local = localStorage.getItem("GO_ACCOUNT");
        if (local) {
            const parsed: LoginResponse = JSON.parse(local);
            if (parsed) {
                const result = await execute(() => Config(), {
                    onSuccess: (isValid) => {
                        setAuthConfig(Boolean(isValid));
                        if (!isValid) {
                            localStorage.removeItem("GO_ACCOUNT");
                        }
                    },
                    onError: () => setAuthConfig(false)
                });

                return Boolean(result);
            }
        }

        setAuthConfig(false);
        return false;

    }, []);

    useEffect(() => {
        void validateSession();
    }, [validateSession]);

    return (
        <AuthenticateContext.Provider value={{ saveState, authConfig, checkingAuth: loading }}>
            {children}
        </AuthenticateContext.Provider>
    );
}

export { AuthenticateContext };

export default AuthenticateProvider;
