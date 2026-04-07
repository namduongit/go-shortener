import { useCallback, useEffect, useMemo, useState } from "react";
import PlanCard from "../../components/ui/plan-card/plan-card";
import { PlanModule } from "../../services/modules/plan.module";
import { useExecute } from "../../common/hooks/useExecute";
import type { PlanListResponse, PlanResponse } from "../../services/types/plan.type";
import { usePlanUsage } from "../../common/hooks/usePlanUsage";

const formatPrice = (price: number) => {
    if (price <= 0) {
        return "Miễn phí";
    }

    // Format to VND price

    return `${price.toLocaleString("vi-VN")} VND`;
};

const formatLimit = (value: number, suffix: string) => {
    if (value <= 0) {
        return `Không giới hạn ${suffix}`;
    }
    
    if (suffix === "URL") {
        return `${value} ${suffix}`;
    }

    // Storage values are shown in GB.
    const gbValue = value / 1024 / 1024 / 1024;

    return `${gbValue.toFixed(2)} GB ${suffix}`;
}

const formatToGb = (value: number) => `${(value / 1024 / 1024 / 1024).toFixed(2)} GB`;

const PlanPage = () => {
    const { myPlanUsage } = usePlanUsage();
    const currentPlan = myPlanUsage?.plan;

    const { GetPlans } = PlanModule;
    const { execute, loading } = useExecute<PlanListResponse>();
    const [plans, setPlans] = useState<PlanResponse[]>([]);

    const loadPlans = useCallback(async () => {
        await execute(() => GetPlans(), {
            onSuccess: (data) => {
                if (Array.isArray(data)) {
                    setPlans(data);
                    return;
                }

                setPlans([]);
            },
            onError: () => {
                setPlans([]);
            },
        });
    }, []);

    useEffect(() => {
        void loadPlans();
    }, [loadPlans]);

    const planCards = useMemo(() => {
        return plans.map((plan) => {
            const isCurrentPlan = Boolean(
                currentPlan && (plan.uuid === currentPlan.uuid || plan.name.toLowerCase() === currentPlan.name.toLowerCase())
            );

            return {
            key: plan.uuid,
            title: plan.name,
            price: formatPrice(plan.price),
            description: `Gói ${plan.name} cho nhu cầu lưu trữ và quản lý URL.`,
            features: [
                formatLimit(plan.url_limit, "URL"),
                formatLimit(plan.storage_limit, "GB lưu trữ"),
            ],
            highlight: isCurrentPlan,
            isCurrentPlan,
        };
        });
    }, [plans, currentPlan]);

    return (
        <div className="space-y-5">
            <header className="rounded-3xl border border-gray-300/90 bg-[#f8fbff] p-5 md:p-7">
                <p className="text-sm font-semibold text-gray-500">Plan</p>
                <h1 className="mt-1 text-3xl font-semibold text-gray-900 md:text-4xl">Nâng cấp gói dịch vụ</h1>
                <p className="mt-2 text-sm text-gray-500">Theo dõi gói hiện tại và chọn cấp độ phù hợp với nhu cầu lưu trữ và URL của bạn.</p>
                <div className="mt-5 overflow-hidden rounded-2xl border border-gray-300/90 bg-white">
                    <table className="w-full text-left text-sm text-gray-900">
                        <thead className="bg-white text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3">Hạng mục</th>
                                <th className="px-4 py-3">Giá trị</th>
                                <th className="px-4 py-3">Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-white">
                                <td className="px-4 py-4 font-semibold text-gray-900">Gói hiện tại</td>
                                <td className="px-4 py-4 text-gray-500">{currentPlan?.name ?? "Chưa xác định"}</td>
                                <td className="px-4 py-4 text-gray-500">Đồng bộ thời gian thực từ server</td>
                            </tr>
                            <tr className="bg-[#fcfdff]">
                                <td className="px-4 py-4 font-semibold text-gray-900">Số URL đã dùng</td>
                                <td className="px-4 py-4 text-gray-500">{myPlanUsage?.used_url ?? 0}/{formatLimit(currentPlan?.url_limit ?? 0, "URL")}</td>
                                <td className="px-4 py-4 text-gray-500">Tổng số URL đã tạo trong gói hiện tại</td>
                            </tr>
                            <tr className="bg-white">
                                <td className="px-4 py-4 font-semibold text-gray-900">Dung lượng</td>
                                <td className="px-4 py-4 text-gray-500">{formatToGb(myPlanUsage?.used_storage ?? 0)}/{formatToGb(myPlanUsage?.total_storage ?? 0)}</td>
                                <td className="px-4 py-4 text-gray-500">Đồng bộ từ API /api/guard/plans</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </header>

            <section className="rounded-3xl border border-gray-300/90 bg-white p-5 md:p-6">
                <h2 className="text-2xl font-semibold text-gray-900">Chọn gói khác</h2>
                <p className="text-sm text-gray-500">So sánh lợi ích giữa các cấp độ để tìm lựa chọn phù hợp.</p>
                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                    {!loading && planCards.length === 0 && (
                        <div className="rounded-2xl border border-gray-300/90 bg-white px-4 py-8 text-sm text-gray-500 lg:col-span-3">
                            Hiện chưa có dữ liệu gói dịch vụ từ server.
                        </div>
                    )}

                    {planCards.map((plan) => (
                        <PlanCard
                            key={plan.key}
                            title={plan.title}
                            price={plan.price}
                            description={plan.description}
                            features={plan.features}
                            highlight={plan.highlight}
                            actionLabel={plan.isCurrentPlan ? "Gói hiện tại" : "Liên hệ nâng cấp"}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default PlanPage;
