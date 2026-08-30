import { Loading } from '@/components';
import { Suspense } from 'react';
import { useTrashListScreen } from '../hooks/use-trash-list';
import { Trash } from './trash';

function TrashContent() {
    const props = useTrashListScreen();
    return (
        <Trash
            {...props}
        />
    );
}

export const TrashContainer = () => {
    return (
        <Suspense
            fallback={<Loading className="h-auto w-full flex-1 py-16" />}
        >
            <TrashContent />
        </Suspense>
    );
};
