import { Loading } from '@/components';
import { Suspense } from 'react';
import { useMyRankingDetail } from '../hooks/use-my-ranking-detail';
import { MyRankingDetail } from './my-ranking-detail';

function MyRankingDetailContent() {
    const { mode, startEdit, returnToView } = useMyRankingDetail();
    return (
        <MyRankingDetail
            mode={mode}
            onStartEdit={startEdit}
            onReturnToView={returnToView}
        />
    );
}

export const MyRankingDetailContainer = () => {
    return (
        <Suspense
            fallback={<Loading className="h-auto w-full flex-1 py-16" />}
        >
            <MyRankingDetailContent />
        </Suspense>
    );
};
