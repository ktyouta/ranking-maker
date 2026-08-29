import { Spinner } from '@/components';
import { Suspense } from 'react';
import { useRankingDetail } from '../hooks/use-ranking-detail';
import { RankingDetail } from './ranking-detail';

function RankingDetailContent() {
    const props = useRankingDetail();
    return (
        <RankingDetail
            {...props}
        />
    );
}

export const RankingDetailContainer = () => {
    return (
        <Suspense
            fallback={
                <div className="flex flex-1 items-center justify-center py-16">
                    <Spinner />
                </div>
            }
        >
            <RankingDetailContent />
        </Suspense>
    );
};
