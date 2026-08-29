import { Spinner } from '@/components';
import { Suspense } from 'react';
import { useMyRankingDetail } from '../hooks/use-my-ranking-detail';
import { MyRankingDetail } from './my-ranking-detail';

function MyRankingDetailContent() {
    const props = useMyRankingDetail();
    return (
        <MyRankingDetail
            {...props}
        />
    );
}

export const MyRankingDetailContainer = () => {
    return (
        <Suspense
            fallback={
                <div className="flex flex-1 items-center justify-center py-16">
                    <Spinner />
                </div>
            }
        >
            <MyRankingDetailContent />
        </Suspense>
    );
};
