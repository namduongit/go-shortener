import { Axios } from "../../libs/api";
import type { RestResponse } from "../../libs/response";
import type { MyPlanUsageResponse, PlanListResponse } from "../types/plan.type";

const api = Axios();

export const PlanModule = {
    async GetPlans() {
        const response = await api.get<RestResponse<PlanListResponse>>("/api/public/plans");
        return response.data;
    },

    async ViewPlan() {
        const response = await api.get<RestResponse<MyPlanUsageResponse>>("/api/guard/plans");
        return response.data;
    }
}
