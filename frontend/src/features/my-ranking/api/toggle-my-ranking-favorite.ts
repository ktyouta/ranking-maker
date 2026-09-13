import { rpc } from '@/lib/rpc-client';
import { useMutation } from '@tanstack/react-query';
import { InferResponseType } from 'hono/client';

const endpoint = rpc.api.v1['my-ranking'][':rankingId'].favorite.$put;

type PropsType = {
    onSuccess: (data: SuccessResponseType) => void;
    onError: (message: string) => void;
};
type VariablesType = {
    rankingId: string;
    isFavorite: boolean;
};
type SuccessResponseType = InferResponseType<typeof endpoint, 200>;

/**
 * お気に入り登録・解除API呼び出し hook
 * 一覧上の複数カードから呼ばれるため、対象の rankingId は呼び出し時（mutate時）に指定する
 */
export function useToggleMyRankingFavoriteMutation(props: PropsType) {
    return useMutation({
        mutationFn: async ({ rankingId, isFavorite }: VariablesType) => {
            const res = await endpoint({ param: { rankingId }, json: { isFavorite } });
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
