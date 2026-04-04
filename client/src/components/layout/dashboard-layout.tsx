import { Outlet } from "react-router";
import Sidebar from "../ui/sidebar/sidebar";
import Header from "../ui/header/header";

const DashboardLayout = () => {
    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <div className="mx-auto container px-3 py-4 md:px-6 md:py-5">
                <Header />
            </div>
            <div className="mx-auto grid container gap-4 px-3 pb-6 md:px-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                <div>
                    <Sidebar />
                </div>
                <div className="rounded-3xl border border-[#d9e1ef] bg-white p-4 shadow-[0_14px_40px_rgba(34,61,102,0.09)] md:p-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
