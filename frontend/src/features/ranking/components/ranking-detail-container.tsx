import { Loading } from '@/components';
import { Suspense } from 'react';
import { useRankingDetail } from '../hooks/use-ranking-detail';
import { RankingDetail } from './ranking-detail';

function RankingDetailContent() {
    const { mode, startEdit, returnToView } = useRankingDetail();
    return (
        <RankingDetail
            mode={mode}
            onStartEdit={startEdit}
            onReturnToView={returnToView}
        />
    );
}

export const RankingDetailContainer = () => {
    return (
        <Suspense
            fallback={<Loading className="h-auto w-full flex-1 py-16" />}
        >
            <RankingDetailContent />
        </Suspense>
    );
};
