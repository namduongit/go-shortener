import type { ReactNode } from "react";
import { Link } from "react-router";

const PublicLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="min-h-screen bg-[#f5f7fb] text-[#202124]">
            <div className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-72" />

                <div className="relative mx-auto flex min-h-screen max-w-370 flex-col px-3 py-4 md:px-6 md:py-5">
                    <header className="mb-4 flex items-center justify-between rounded-3xl border border-[#d9e1ef] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(34,61,102,0.08)] md:px-5">
                        <Link to="/" className="flex items-center gap-4">
                            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#1a73e8] text-base font-black text-white">
                                GMS
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5f6368]">Cloud suite</p>
                                <p className="text-lg font-semibold text-[#202124]">GMS Cloud</p>
                            </div>
                        </Link>

                        <div className="hidden items-center gap-2 md:flex">
                            <Link
                                to="/auth/login"
                                className="rounded-full border border-[#d9e1ef] px-4 py-2 text-sm font-semibold text-[#202124] transition hover:bg-[#f8f9fa]"
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                to="/auth/register"
                                className="rounded-full bg-[#1a73e8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#175fc0]"
                            >
                                Đăng ký
                            </Link>
                        </div>
                    </header>

                    <main className="flex-1">{children}</main>
                </div>
            </div>
        </div>
    );
};

export default PublicLayout;