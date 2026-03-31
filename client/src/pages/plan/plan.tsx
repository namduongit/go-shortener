const plans = [
    {
        id: "Essentials",
        price: "$19",
        description: "Phù hợp cho cá nhân hoặc nhóm nhỏ cần rút gọn URL cơ bản.",
        features: ["50 URL/tháng", "2 thành viên", "Báo cáo theo tuần"],
    },
    {
        id: "Studio",
        price: "$49",
        description: "Đáp ứng nhu cầu agency nhỏ với bộ lọc nâng cao và chia sẻ file.",
        features: ["Không giới hạn URL", "10 thành viên", "API ưu tiên", "Lưu trữ 200 GB"],
        highlight: true,
    },
    {
        id: "Enterprise",
        price: "Liên hệ",
        description: "Tích hợp SSO, SLA riêng và tư vấn tối ưu chiến dịch.",
        features: ["Tùy chỉnh bảo mật", "Quản lý phân quyền", "Chuyên gia hỗ trợ"],
    },
];

const PlanPage = () => {
    return (
        <div className="space-y-8">
            <header className="rounded-3xl border border-[#ded7c7] bg-white/95 p-10 shadow-[0_25px_90px_rgba(20,16,12,0.12)]">
                <p className="text-xs uppercase tracking-[0.45em] text-[#8b714c]">Plan</p>
                <h1 className="mt-3 text-4xl font-serif text-[#1f1d19]">Nâng cấp trải nghiệm</h1>
                <p className="mt-2 text-sm text-[#4d493f]">Chọn gói phù hợp để mở khóa nhiều URL hơn, dung lượng lớn hơn và workflow tự động.</p>
                <div className="mt-6 overflow-hidden rounded-2xl border border-[#e4dbcc]">
                    <table className="w-full text-left text-sm text-[#3a3630]">
                        <thead className="bg-[#f7f3ea] text-xs uppercase tracking-wide text-[#7b6a4a]">
                            <tr>
                                <th className="px-4 py-3">Hạng mục</th>
                                <th className="px-4 py-3">Giá trị</th>
                                <th className="px-4 py-3">Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-white">
                                <td className="px-4 py-4 font-semibold text-[#2d2a26]">Gói hiện tại</td>
                                <td className="px-4 py-4 text-[#4d493f]">Studio</td>
                                <td className="px-4 py-4 text-[#4d493f]">Gia hạn sau 12 ngày</td>
                            </tr>
                            <tr className="bg-[#fbf9f3]">
                                <td className="px-4 py-4 font-semibold text-[#2d2a26]">Số URL đã dùng</td>
                                <td className="px-4 py-4 text-[#4d493f]">198/Không giới hạn</td>
                                <td className="px-4 py-4 text-[#4d493f]">Bao gồm chiến dịch 2026</td>
                            </tr>
                            <tr className="bg-white">
                                <td className="px-4 py-4 font-semibold text-[#2d2a26]">Dung lượng</td>
                                <td className="px-4 py-4 text-[#4d493f]">73%</td>
                                <td className="px-4 py-4 text-[#4d493f]">Lưu trữ 146 GB / 200 GB</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </header>

            <section className="rounded-3xl border border-[#dcd5c5] bg-white/95 p-8 shadow-[0_20px_70px_rgba(20,16,12,0.08)]">
                <h2 className="text-2xl font-serif text-[#1f1d19]">Chọn gói khác</h2>
                <p className="text-sm text-[#5a5347]">So sánh lợi ích giữa các cấp độ để tìm lựa chọn phù hợp.</p>
                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`rounded-3xl border px-6 py-6 ${
                                plan.highlight
                                    ? "border-[#bfa77f] bg-[#f6f0e5] shadow-[0_25px_80px_rgba(20,16,12,0.15)]"
                                    : "border-[#e5ddcf] bg-[#fbf9f3]"
                            }`}
                        >
                            <p className="text-xs uppercase tracking-[0.35em] text-[#8b714c]">{plan.id}</p>
                            <p className="mt-3 text-4xl font-serif text-[#1f1d19]">{plan.price}</p>
                            <p className="mt-2 text-sm text-[#4d493f]">{plan.description}</p>
                            <ul className="mt-4 space-y-2 text-sm text-[#342f28]">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-2">
                                        <span className="text-[#7a6544]">•</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <button className="mt-6 w-full rounded-2xl border border-[#c2b8a8] px-4 py-2 text-sm font-semibold text-[#2d2a26] transition hover:bg-white">
                                {plan.highlight ? "Giữ gói hiện tại" : "Liên hệ nâng cấp"}
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default PlanPage;
