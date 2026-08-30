import { Loading } from '@/components';
import { Suspense } from 'react';
import { useTrashDetailScreen } from '../hooks/use-trash-detail';
import { TrashDetail } from './trash-detail';

function TrashDetailContent() {
    const props = useTrashDetailScreen();
    return (
        <TrashDetail
            {...props}
        />
    );
}

export const TrashDetailContainer = () => {
    return (
        <Suspense
            fallback={<Loading className="h-auto w-full flex-1 py-16" />}
        >
            <TrashDetailContent />
        </Suspense>
    );
};
