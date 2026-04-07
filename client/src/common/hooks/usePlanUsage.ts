import { useContext } from "react";
import { PlanUsageContext } from "../contexts/plan-usage";

export const usePlanUsage = () => {
    const context = useContext(PlanUsageContext);
    if (!context) {
        throw new Error("Require PlanUsageProvider to use this hook");
    }

    return context;
};
