import { Axios } from "../../libs/api";
import type { RestResponse } from "../../libs/response";
import type { PlanListResponse } from "../types/plan.type";

const api = Axios();

export const PlanModule = {
    async GetPlans() {
        const response = await api.get<RestResponse<PlanListResponse>>("/api/public/plans");
        return response.data;
    },
}
