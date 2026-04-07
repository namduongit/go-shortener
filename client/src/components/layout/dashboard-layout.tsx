import { Outlet } from "react-router";
import Sidebar from "../ui/sidebar/sidebar";
import Header from "../ui/header/header";

const DashboardLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto w-[95%] px-3 py-4 md:px-6 md:py-5">
                <Header />
            </div>
            <div className="mx-auto grid w-[95%] gap-4 px-3 pb-6 md:px-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                <div>
                    <Sidebar />
                </div>
                <div className="rounded-2xl border border-gray-300/90 bg-white p-4 md:p-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
