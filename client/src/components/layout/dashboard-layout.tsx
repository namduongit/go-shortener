import { Outlet } from "react-router";
import Sidebar from "../ui/sidebar/sidebar";
import Header from "../ui/header/header";

const DashboardLayout = () => {
    return (
        <div className="min-h-screen bg-[#f4f1ea] px-4 py-8 md:px-10">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:grid lg:grid-cols-[300px_minmax(0,1fr)]">
                <div className="order-1">
                    <Sidebar />
                </div>
                <div className="order-2">
                    <Header />
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
