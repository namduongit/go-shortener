import { useState } from "react"
import type { RestFulResponse } from "../../libs/response";

type ExecuteOptions = {
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
}

export const useExecute = <T>() => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);
    const [data, setData] = useState<T | undefined>(undefined);

    const execute = async (
        func: () => Promise<RestFulResponse<T>>,
        options?: ExecuteOptions
    ): Promise<T | undefined> => {
        try {
            setLoading(true);
            const result = await func();

            console.log("======= Result debug: ", result);

            setData(result.data);
            options?.onSuccess?.(result.data);
            return result.data;

        } catch (error: unknown) {
            console.log("=======    Error debug: ", error);
            setError(error);
            options?.onError?.(error);
        } finally {
            setLoading(false);
        }

        return undefined;
    }

    const executeWithDeclareResponse = async <R>(
        func: () => Promise<RestFulResponse<R>>,
        options?: ExecuteOptions
    ): Promise<R | undefined> => {
        try {
            setLoading(true);
            const result = await func();

            console.log("======= Result debug: ", result);

            setData(result.data as unknown as T);
            options?.onSuccess?.(result.data);
            return result.data;

        } catch (error: unknown) {
            console.log("=======    Error debug: ", error);
            setError(error);
            options?.onError?.(error);
        } finally {
            setLoading(false);
        }

        return undefined;
    }

    return { loading, error, data, execute, executeWithDeclareResponse };
}