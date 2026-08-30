import { rpc } from '@/lib/rpc-client';
import { useMutation } from '@tanstack/react-query';
import type { InferResponseType } from 'hono/client';

const endpoint = rpc.api.v1['my-ranking'].trash[':rankingId'].restore.$patch;

type SuccessResponseType = InferResponseType<typeof endpoint, 200>;

type PropsType = {
    rankingId: string;
    onSuccess: (data: SuccessResponseType) => void;
    onError: (message: string) => void;
};

/**
 * ランキング復元API呼び出し hook
 * @param props.rankingId 復元対象のランキングID
 */
export function useRestoreTrashMutation(props: PropsType) {
    return useMutation({
        mutationFn: async () => {
            const res = await endpoint({ param: { rankingId: props.rankingId } });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message);
            }
            return res.json();
        },
        onSuccess: (data) => {
            props.onSuccess(data);
        },
        onError: (error: Error) => {
            props.onError(error.message);
        },
    });
}
