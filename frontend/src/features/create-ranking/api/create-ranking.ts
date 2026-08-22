import { rpc } from '@/lib/rpc-client';
import { useMutation } from '@tanstack/react-query';
import type { InferRequestType, InferResponseType } from 'hono/client';

const endpoint = rpc.api.v1['my-ranking'].$post;

type SuccessResponseType = InferResponseType<typeof endpoint, 201>;
type RequestType = InferRequestType<typeof endpoint>['json'];

export type ViolationType = {
    field: string;
    message: string;
};

/**
 * バリデーションエラー・不適切内容エラーの `data` を保持する専用エラー型
 */
class CreateRankingError extends Error {
    readonly violations?: ViolationType[];

    constructor(message: string, violations?: ViolationType[]) {
        super(message);
        this.violations = violations;
    }
}

type PropsType = {
    onSuccess: (data: SuccessResponseType) => void;
    onError: (message: string, violations?: ViolationType[]) => void;
};

export function useCreateRankingMutation(props: PropsType) {
    return useMutation({
        mutationFn: async (data: RequestType) => {
            const res = await endpoint({ json: data });
            // `!res.ok` 経由の narrowing だと Hono の型推論で `data` が欠落するため、422 のみ `res.status` の literal narrowing で個別に扱う
            if (res.status === 422) {
                const error = await res.json();
                throw new CreateRankingError(error.message, error.data);
            }
            if (!res.ok) {
                const error = await res.json();
                throw new CreateRankingError(error.message);
            }
            return res.json();
        },
        onSuccess: (data) => {
            props.onSuccess(data);
        },
        onError: (error: CreateRankingError) => {
            props.onError(error.message, error.violations);
        },
    });
}
