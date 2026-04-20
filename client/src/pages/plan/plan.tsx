import { useCallback, useEffect, useMemo, useState } from "react";
import PlanCard from "../../components/ui/plan-card/plan-card";
import { PlanModule } from "../../services/modules/plan.module";
import { useExecute } from "../../common/hooks/useExecute";
import type { PlanListResponse, PlanResponse } from "../../services/types/plan.type";
import { useAuthenticate } from "../../common/hooks/useAuthenticate";
import { formatFileSize } from "../../services/utils/file";

const formatPrice = (price: number) => {
    if (price <= 0) {
        return "Miễn phí";
    }
    return `${price.toLocaleString("vi-VN")} VND`;
};

const formatStorageLimit = (value: number) => {
    if (value <= 0) {
        return "Không giới hạn lưu trữ";
    }
    return `${formatFileSize(value)} lưu trữ`;
};

const PlanPage = () => {
    const { authConfig } = useAuthenticate();
    const usage = authConfig?.usage;

    const currentPlan = {
        uuid: usage?.plan_uuid ?? "",
        name: authConfig?.plan_name ?? "",
    };

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
                plan.uuid === currentPlan.uuid ||
                    plan.name.toLowerCase() === currentPlan.name.toLowerCase()
            );

            return {
                key: plan.uuid,
                title: plan.name,
                price: formatPrice(plan.price),
                description: `Gói ${plan.name} cho nhu cầu lưu trữ và chia sẻ tệp.`,
                features: [formatStorageLimit(plan.storage_limit)],
                highlight: isCurrentPlan,
                isCurrentPlan,
            };
        });
    }, [plans, currentPlan.uuid, currentPlan.name]);

    return (
        <div className="space-y-4">
            <header className="rounded-xl border border-gray-300/90 bg-white p-5">
                <p className="text-sm font-semibold text-gray-500">Plan</p>
                <h1 className="mt-1 text-2xl font-semibold text-gray-900">Gói dịch vụ</h1>
                <p className="mt-1 text-sm text-gray-500">Theo dõi mức sử dụng và so sánh các gói.</p>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-gray-300/90 bg-white p-3">
                        <p className="text-xs font-semibold uppercase text-gray-500">Gói hiện tại</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">
                            {currentPlan.name || "Chưa xác định"}
                        </p>
                    </div>
                    <div className="rounded-lg border border-gray-300/90 bg-white p-3">
                        <p className="text-xs font-semibold uppercase text-gray-500">Dung lượng</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">
                            {formatFileSize(usage?.used_storage ?? 0)}/{formatFileSize(usage?.total_bytes ?? 0)}
                        </p>
                    </div>
                </div>
            </header>

            <section className="rounded-xl border border-gray-300/90 bg-white p-5">
                <h2 className="text-xl font-semibold text-gray-900">Danh sách gói</h2>
                <p className="text-sm text-gray-500">Chọn gói phù hợp với nhu cầu hiện tại.</p>
                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    {!loading && planCards.length === 0 && (
                        <div className="rounded-lg border border-gray-300/90 bg-white px-4 py-8 text-sm text-gray-500 lg:col-span-3">
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