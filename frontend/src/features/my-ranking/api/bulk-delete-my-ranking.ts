import { rpc } from '@/lib/rpc-client';
import { useMutation } from '@tanstack/react-query';
import { InferResponseType } from 'hono/client';

const endpoint = rpc.api.v1['my-ranking']['bulk-delete'].$post;

type PropsType = {
    onSuccess: (data: SuccessResponseType) => void;
    onError: (message: string) => void;
};
type SuccessResponseType = InferResponseType<typeof endpoint, 200>;

/**
 * ランキング一括削除（論理削除）API呼び出し hook
 */
export function useBulkDeleteMyRankingMutation(props: PropsType) {
    return useMutation({
        mutationFn: async (ids: string[]) => {
            const res = await endpoint({ json: { ids } });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message);
            }
            return res.json();
        },
        onSuccess: (data: SuccessResponseType) => {
            props.onSuccess(data);
        },
        onError: (error: Error) => {
            props.onError(error.message);
        },
    });
}
