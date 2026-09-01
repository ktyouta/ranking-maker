import { rpc } from '@/lib/rpc-client';
import { useMutation } from '@tanstack/react-query';
import type { InferRequestType } from 'hono/client';

const endpoint = rpc.api.v1.user[':userId'].theme.$patch;

type RequestType = InferRequestType<typeof endpoint>;


export function useUpdateUserThemeMutation() {
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
    });
}
