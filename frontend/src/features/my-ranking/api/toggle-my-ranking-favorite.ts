import { rpc } from '@/lib/rpc-client';
import { useMutation } from '@tanstack/react-query';

const endpoint = rpc.api.v1['my-ranking'][':rankingId'].favorite.$put;

type VariablesType = {
    rankingId: string;
    isFavorite: boolean;
};
type PropsType<T> = {
    onMutate: (variables: VariablesType) => Promise<T>;
    onError: (context: T | undefined, message: string) => void;
};

/**
 * お気に入り登録・解除API呼び出し hook
 * 一覧上の複数カードから呼ばれるため、対象の rankingId は呼び出し時（mutate時）に指定する
 */
export function useToggleMyRankingFavoriteMutation<T>(props: PropsType<T>) {
    return useMutation({
        mutationFn: async ({ rankingId, isFavorite }: VariablesType) => {
            const res = await endpoint({ param: { rankingId }, json: { isFavorite } });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message);
            }
            return res.json();
        },
        onMutate: props.onMutate,
        onError: (err, _variables, context) => {
            props.onError(context, err.message);
        },
    });
}
