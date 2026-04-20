import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router";
import { useAuthenticate } from "../../common/hooks/useAuthenticate";

interface ProtectedRouteProps {
    redirectPath?: string;
    children?: ReactNode;
}

const ProtectedRoute = ({ redirectPath = "/auth/login", children }: ProtectedRouteProps) => {
    const { authConfig, state, initialized } = useAuthenticate();

    if (!initialized) {
        return (
            <div className="flex gap-5 min-h-screen items-center justify-center bg-white">
                <div className="loading flex flex-col gap-2">
                    <div className="flex gap-2">
                        <div className="w-4 h-4 bg-blue-500"></div>
                        <div className="w-4 h-4 bg-green-500"></div>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-4 h-4 bg-green-500"></div>
                        <div className="w-4 h-4 bg-blue-500"></div>
                    </div>
                </div>

                <div className="flex gap-2 items-center">
                    <span className="px-2 py-3 bg-blue-500 text-white font-semibold rounded shadow">GMS</span>
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-600 font-semibold">WORK SPACE</span>
                        <span className="text-sm font-semibold">CLOUD</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!authConfig || !state) {
        return <Navigate to={redirectPath} replace />;
    }

    if (children) {
        return <>{children}</>;
    }

    return <Outlet />;
};

export default ProtectedRoute;
