import { rpc } from '@/lib/rpc-client';
import { useMutation } from '@tanstack/react-query';
import type { InferRequestType, InferResponseType } from 'hono/client';

const endpoint = rpc.api.v1['frontuser-password'][':userId'].$patch;

type SuccessResponseType = InferResponseType<typeof endpoint, 200>;
type RequestType = InferRequestType<typeof endpoint>;

type PropsType = {
    onSuccess: (data: SuccessResponseType) => void;
    onError: (message: string) => void;
};

export function useUpdatePasswordMutation(props: PropsType) {
    return useMutation({
        mutationFn: async (data: { userId: string; json: RequestType['json'] }) => {
            const res = await endpoint({
                param: { userId: data.userId },
                json: data.json,
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message);
            }
            return res.json();
        },
        onSuccess: props.onSuccess,
        onError: (error: Error) => {
            props.onError(error.message);
        },
    });
}