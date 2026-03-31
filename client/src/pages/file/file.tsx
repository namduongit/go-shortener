import { useEffect, useState } from "react";
import { FileModule } from "../../services/modules/file.module";
import CreateFolderModal from "../../components/ui/modal/create-folder/create-folder-modal";

const fileSamples = [
    { id: "FL-1201", name: "Quarterly-brief.pdf", size: "4.2 MB", createdAt: "18/03/2026" },
    { id: "FL-1188", name: "Route-mapping.xlsx", size: "2.8 MB", createdAt: "10/03/2026" },
    { id: "FL-1177", name: "Product-shot-01.png", size: "1.1 MB", createdAt: "01/03/2026" },
];

const FilePage = () => {
    const { GetFiles } = FileModule;
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);

    useEffect(() => {
        GetFiles();
    }, []);

    const handleCreateFolder = (folderName: string) => {
        console.log("Creating folder:", folderName);
    };

    return (
        <div className="space-y-8">
            <header className="rounded-3xl border border-[#ded7c7] bg-white/95 p-10 shadow-[0_25px_90px_rgba(20,16,12,0.12)]">
                <p className="text-xs uppercase tracking-[0.45em] text-[#8b714c]">Manage file</p>
                <h1 className="mt-3 text-4xl font-serif text-[#1f1d19]">Tủ tài liệu chiến dịch</h1>
                <p className="mt-2 text-sm text-[#4d493f]">Lưu trữ hình ảnh, báo cáo và mọi tệp hỗ trợ hoạt động marketing.</p>
                <div className="mt-6 flex flex-col gap-3 md:flex-row">
                    <button
                        className="rounded-2xl border border-[#c2b8a8] px-5 py-2 text-sm font-semibold text-[#2d2a26] transition hover:bg-[#f4efe5]"
                        onClick={() => setIsCreateFolderOpen(true)}
                    >
                        Tạo thư mục
                    </button>
                    <button className="rounded-2xl bg-[#2d2a26] px-5 py-2 text-sm font-semibold tracking-wide text-white transition hover:bg-[#1c1915]">Tải tệp lên</button>
                </div>
            </header>

            <section className="rounded-3xl border border-[#dcd5c5] bg-white/95 p-8 shadow-[0_20px_70px_rgba(20,16,12,0.08)]">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-serif text-[#1f1d19]">Danh sách tệp</h2>
                        <p className="text-sm text-[#5a5347]">Tập trung những tệp thường dùng, dễ tìm kiếm và chia sẻ.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="rounded-xl border border-[#d4ccbd] px-4 py-2 text-sm text-[#2d2a26] transition hover:bg-[#f7f3ea]">Sắp xếp</button>
                        <button className="rounded-xl border border-[#d4ccbd] px-4 py-2 text-sm text-[#2d2a26] transition hover:bg-[#f7f3ea]">Chia sẻ</button>
                    </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-[#e5ddcf]">
                    <table className="w-full text-left text-sm text-[#3a3630]">
                        <thead className="bg-[#f7f3ea] text-xs uppercase tracking-wide text-[#7b6a4a]">
                            <tr>
                                <th className="px-4 py-3">Mã</th>
                                <th className="px-4 py-3">Tên tệp</th>
                                <th className="px-4 py-3">Kích cỡ</th>
                                <th className="px-4 py-3">Ngày tạo</th>
                                <th className="px-4 py-3 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fileSamples.map((file, index) => (
                                <tr key={file.id} className={index % 2 === 0 ? "bg-white" : "bg-[#fbf9f3]"}>
                                    <td className="px-4 py-4 font-semibold text-[#2d2a26]">{file.id}</td>
                                    <td className="px-4 py-4 text-[#4d493f]">{file.name}</td>
                                    <td className="px-4 py-4 text-[#4d493f]">{file.size}</td>
                                    <td className="px-4 py-4 text-[#4d493f]">{file.createdAt}</td>
                                    <td className="px-4 py-4 text-right">
                                        <button className="rounded-full border border-[#d4ccbd] px-4 py-1 text-xs font-semibold text-[#2d2a26] transition hover:bg-[#f7f3ea]">Chi tiết</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <CreateFolderModal
                isOpen={isCreateFolderOpen}
                onClose={() => setIsCreateFolderOpen(false)}
                onSubmit={handleCreateFolder}
            />
        </div>
    );
};

export default FilePage;
