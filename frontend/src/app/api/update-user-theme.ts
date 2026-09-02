import { rpc } from '@/lib/rpc-client';
import { useMutation } from '@tanstack/react-query';
import type { InferRequestType } from 'hono/client';

const endpoint = rpc.api.v1.user.theme.$patch;

type RequestType = InferRequestType<typeof endpoint>;


export function useUpdateUserThemeMutation() {
    return useMutation({
        mutationFn: async (data: { json: RequestType['json'] }) => {
            const res = await endpoint({
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
