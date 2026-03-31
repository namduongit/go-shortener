const apiIntegrations = [
    { id: "firebase", name: "Firebase Realtime DB", status: "Chưa kết nối", description: "Đồng bộ URL trực tiếp vào database." },
    { id: "supabase", name: "Supabase", status: "Đang thử nghiệm", description: "Tự động lưu log hoạt động." },
];

const AccountApiPage = () => {
    return (
        <div className="space-y-8">
            <header className="rounded-3xl border border-[#ded7c7] bg-white/95 p-10 shadow-[0_25px_90px_rgba(20,16,12,0.12)]">
                <p className="text-xs uppercase tracking-[0.45em] text-[#8b714c]">API</p>
                <h1 className="mt-3 text-4xl font-serif text-[#1f1d19]">Đấu API & webhook</h1>
                <p className="mt-2 text-sm text-[#4d493f]">Kết nối dịch vụ của bạn để tự động hóa quy trình quản lý URL.</p>
                <div className="mt-4 flex flex-col gap-3 md:flex-row">
                    <button className="rounded-2xl border border-[#c2b8a8] px-5 py-2 text-sm font-semibold text-[#2d2a26] transition hover:bg-[#f4efe5]">Tạo API Key</button>
                    <button className="rounded-2xl bg-[#2d2a26] px-5 py-2 text-sm font-semibold tracking-wide text-white transition hover:bg-[#1c1915]">Sinh Webhook mới</button>
                </div>
            </header>

            <section className="rounded-3xl border border-[#dcd5c5] bg-white/95 p-8 shadow-[0_20px_70px_rgba(20,16,12,0.08)]">
                <table className="w-full text-left text-sm text-[#3a3630]">
                    <thead className="bg-[#f7f3ea] text-xs uppercase tracking-wide text-[#7b6a4a]">
                        <tr>
                            <th className="px-4 py-3">Dịch vụ</th>
                            <th className="px-4 py-3">Trạng thái</th>
                            <th className="px-4 py-3">Mô tả</th>
                            <th className="px-4 py-3 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {apiIntegrations.map((service, index) => (
                            <tr key={service.id} className={index % 2 === 0 ? "bg-white" : "bg-[#fbf9f3]"}>
                                <td className="px-4 py-4 font-semibold text-[#2d2a26]">{service.name}</td>
                                <td className="px-4 py-4 text-[#4d493f]">{service.status}</td>
                                <td className="px-4 py-4 text-[#4d493f]">{service.description}</td>
                                <td className="px-4 py-4 text-right">
                                    <button className="rounded-full border border-[#d4ccbd] px-4 py-1 text-xs font-semibold text-[#2d2a26] transition hover:bg-[#f7f3ea]">Kết nối</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
};

export default AccountApiPage;
