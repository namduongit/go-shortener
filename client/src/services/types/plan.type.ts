export type PlanResponse = {
    uuid: string;
    name: string;
    price: number;
    storage_limit: number;
    url_limit: number;
}

export type PlanListResponse = PlanResponse[];

export type MyPlanUsageResponse = {
    plan: PlanResponse;
    total_storage: number;
    used_storage: number;
    used_url: number;
}