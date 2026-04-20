import type { ReactNode } from "react";
import { Link } from "react-router";

const PublicLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <div className="mx-auto flex min-h-screen max-w-370 flex-col px-3 py-4 md:px-6 md:py-5">
                <header className="mb-4 flex items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 md:px-5">
                    <Link to="/" className="flex items-center gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-md bg-[#1a73e8] text-sm font-black text-white">
                                GMS
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500">Cloud suite</p>
                                <p className="text-base font-semibold text-gray-900">GMS Cloud</p>
                            </div>
                        </Link>

                        <div className="hidden items-center gap-2 md:flex">
                            <Link
                                to="/auth/login"
                                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                to="/auth/register"
                                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                            >
                                Đăng ký
                            </Link>
                        </div>
                </header>

                <main className="flex-1">{children}</main>
            </div>
        </div>
    );
};

export default PublicLayout;