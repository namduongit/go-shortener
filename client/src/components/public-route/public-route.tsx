import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router";
import { useAuthenticate } from "../../common/hooks/useAuthenticate";

interface PublicRouteProps {
    redirectPath?: string;
    children?: ReactNode;
}

const PublicRoute = ({ redirectPath = "/page/urls", children }: PublicRouteProps) => {
    const { authConfig, checkingAuth } = useAuthenticate();

    if (checkingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f8f5ee]">
                <div className="rounded-2xl border border-[#e0dacb] bg-white/90 px-8 py-6 text-center shadow-md">
                    <p className="text-sm font-semibold tracking-wide text-[#7c6540] uppercase">Đang xác thực phiên</p>
                    <p className="mt-2 text-sm text-[#4d493f]">Vui lòng chờ trong giây lát...</p>
                </div>
            </div>
        );
    }

    if (authConfig) {
        return <Navigate to={redirectPath} replace />;
    }

    if (children) {
        return <>{children}</>;
    }

    return <Outlet />;
};

export default PublicRoute;
