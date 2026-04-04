import PlanCard from "../../components/ui/plan-card/plan-card";

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
        <div className="space-y-5">
            <header className="rounded-3xl border border-[#e3e8f2] bg-[#f8fbff] p-5 md:p-7">
                <p className="text-sm font-semibold text-[#5f6368]">Plan</p>
                <h1 className="mt-1 text-3xl font-semibold text-[#202124] md:text-4xl">Nâng cấp gói dịch vụ</h1>
                <p className="mt-2 text-sm text-[#5f6368]">Theo dõi gói hiện tại và chọn cấp độ phù hợp với nhu cầu lưu trữ và URL của bạn.</p>
                <div className="mt-5 overflow-hidden rounded-2xl border border-[#e5eaf4] bg-white">
                    <table className="w-full text-left text-sm text-[#202124]">
                        <thead className="bg-[#fafbfd] text-xs uppercase tracking-wide text-[#5f6368]">
                            <tr>
                                <th className="px-4 py-3">Hạng mục</th>
                                <th className="px-4 py-3">Giá trị</th>
                                <th className="px-4 py-3">Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-white">
                                <td className="px-4 py-4 font-semibold text-[#202124]">Gói hiện tại</td>
                                <td className="px-4 py-4 text-[#5f6368]">Studio</td>
                                <td className="px-4 py-4 text-[#5f6368]">Gia hạn sau 12 ngày</td>
                            </tr>
                            <tr className="bg-[#fcfdff]">
                                <td className="px-4 py-4 font-semibold text-[#202124]">Số URL đã dùng</td>
                                <td className="px-4 py-4 text-[#5f6368]">198/Không giới hạn</td>
                                <td className="px-4 py-4 text-[#5f6368]">Bao gồm chiến dịch 2026</td>
                            </tr>
                            <tr className="bg-white">
                                <td className="px-4 py-4 font-semibold text-[#202124]">Dung lượng</td>
                                <td className="px-4 py-4 text-[#5f6368]">73%</td>
                                <td className="px-4 py-4 text-[#5f6368]">Lưu trữ 146 GB / 200 GB</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </header>

            <section className="rounded-3xl border border-[#e3e8f2] bg-white p-5 md:p-6">
                <h2 className="text-2xl font-semibold text-[#202124]">Chọn gói khác</h2>
                <p className="text-sm text-[#5f6368]">So sánh lợi ích giữa các cấp độ để tìm lựa chọn phù hợp.</p>
                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <PlanCard
                            key={plan.id}
                            title={plan.id}
                            price={plan.price}
                            description={plan.description}
                            features={plan.features}
                            highlight={plan.highlight}
                            actionLabel={plan.highlight ? "Giữ gói hiện tại" : "Liên hệ nâng cấp"}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default PlanPage;
