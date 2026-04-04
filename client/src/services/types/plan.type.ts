export type PlanResponse = {
    id: number;
    name: string;
    price: number;
    storage_limit: number;
    url_limit: number;
}

export type PlanListResponse = PlanResponse[];