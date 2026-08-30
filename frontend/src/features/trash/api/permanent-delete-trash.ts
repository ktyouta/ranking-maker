import { rpc } from '@/lib/rpc-client';
import { useMutation } from '@tanstack/react-query';

const endpoint = rpc.api.v1['my-ranking'].trash[':rankingId'].$delete;

type PropsType = {
    rankingId: string;
    onSuccess: () => void;
    onError: (message: string) => void;
};

/**
 * ランキング完全削除API呼び出し hook
 * @param props.rankingId 完全削除対象のランキングID
 */
export function usePermanentDeleteTrashMutation(props: PropsType) {
    return useMutation({
        mutationFn: async () => {
            const res = await endpoint({ param: { rankingId: props.rankingId } });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message);
            }
            return res.json();
        },
        onSuccess: () => {
            props.onSuccess();
        },
        onError: (error: Error) => {
            props.onError(error.message);
        },
    });
}
