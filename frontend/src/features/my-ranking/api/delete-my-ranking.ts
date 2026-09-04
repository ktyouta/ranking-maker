import { rpc } from '@/lib/rpc-client';
import { useMutation } from '@tanstack/react-query';
import { InferResponseType } from 'hono/client';

const endpoint = rpc.api.v1['my-ranking'][':rankingId'].$delete;

type PropsType = {
    rankingId: string;
    onSuccess: (data: SuccessResponseType) => void;
    onError: (message: string) => void;
};
type SuccessResponseType = InferResponseType<typeof endpoint, 200>;

/**
 * ランキング削除API呼び出し hook
 * @param props.rankingId 削除対象のランキングID
 */
export function useDeleteMyRankingMutation(props: PropsType) {
    return useMutation({
        mutationFn: async () => {
            const res = await endpoint({ param: { rankingId: props.rankingId } });
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
