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
            <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb]">
                <div className="rounded-2xl border border-[#d9e1ef] bg-white px-8 py-6 text-center shadow-[0_14px_40px_rgba(34,61,102,0.09)]">
                    <p className="text-sm font-semibold tracking-[0.14em] text-[#5f6368] uppercase">Đang xác thực phiên</p>
                    <p className="mt-2 text-sm text-[#5f6368]">Vui lòng chờ trong giây lát...</p>
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
