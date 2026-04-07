import { createContext, useCallback, useEffect, useState } from "react";
import { PlanModule } from "../../services/modules/plan.module";
import { useExecute } from "../hooks/useExecute";
import type { MyPlanUsageResponse } from "../../services/types/plan.type";
import { useAuthenticate } from "../hooks/useAuthenticate";

type PlanUsageContextType = {
    myPlanUsage: MyPlanUsageResponse | undefined;
    loadingPlanUsage: boolean;
    refreshPlanUsage: () => Promise<void>;
};

const PlanUsageContext = createContext<PlanUsageContextType | undefined>(undefined);

const PlanUsageProvider = ({ children }: { children: React.ReactNode }) => {
    const { ViewPlan } = PlanModule;
    const { authConfig, checkingAuth } = useAuthenticate();
    const { execute, loading } = useExecute<MyPlanUsageResponse>();

    const [myPlanUsage, setMyPlanUsage] = useState<MyPlanUsageResponse | undefined>(undefined);

    const refreshPlanUsage = useCallback(async () => {
        await execute(() => ViewPlan(), {
            onSuccess: (data) => {
                setMyPlanUsage(data);
            },
            onError: () => {
                setMyPlanUsage(undefined);
            },
        });
    }, []);

    useEffect(() => {
        if (checkingAuth || !authConfig) {
            return;
        }

        void refreshPlanUsage();

        const timer = window.setInterval(() => {
            void refreshPlanUsage();
        }, 30000);

        return () => {
            window.clearInterval(timer);
        };
    }, [checkingAuth, authConfig, refreshPlanUsage]);

    return (
        <PlanUsageContext.Provider
            value={{
                myPlanUsage,
                loadingPlanUsage: loading,
                refreshPlanUsage,
            }}
        >
            {children}
        </PlanUsageContext.Provider>
    );
};

export { PlanUsageContext };
export default PlanUsageProvider;
