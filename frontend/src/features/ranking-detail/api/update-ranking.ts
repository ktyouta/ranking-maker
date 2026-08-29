import { rpc } from '@/lib/rpc-client';
import { useMutation } from '@tanstack/react-query';
import type { InferRequestType, InferResponseType } from 'hono/client';

const endpoint = rpc.api.v1['my-ranking'][':rankingId'].$patch;

type SuccessResponseType = InferResponseType<typeof endpoint, 200>;
type RequestType = InferRequestType<typeof endpoint>['json'];

export type ViolationType = {
    field: string;
    message: string;
};

/**
 * バリデーションエラー・不適切内容エラーの `data` を保持する専用エラー型
 */
class UpdateRankingError extends Error {
    readonly violations?: ViolationType[];

    constructor(message: string, violations?: ViolationType[]) {
        super(message);
        this.violations = violations;
    }
}

type PropsType = {
    rankingId: string;
    onSuccess: (data: SuccessResponseType) => void;
    onError: (message: string, violations?: ViolationType[]) => void;
};

export function useUpdateRankingMutation(props: PropsType) {
    return useMutation({
        mutationFn: async (data: RequestType) => {
            const res = await endpoint({ param: { rankingId: props.rankingId }, json: data });
            // `!res.ok` 経由の narrowing だと Hono の型推論で `data` が欠落するため、422 のみ `res.status` の literal narrowing で個別に扱う
            if (res.status === 422) {
                const error = await res.json();
                throw new UpdateRankingError(error.message, error.data);
            }
            if (!res.ok) {
                const error = await res.json();
                throw new UpdateRankingError(error.message);
            }
            return res.json();
        },
        onSuccess: (data) => {
            props.onSuccess(data);
        },
        onError: (error: UpdateRankingError) => {
            props.onError(error.message, error.violations);
        },
    });
}
