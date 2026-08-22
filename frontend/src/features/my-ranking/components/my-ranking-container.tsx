import { Spinner } from '@/components';
import { Suspense } from 'react';
import { useMyRankingList } from "../hooks/use-my-ranking-list";
import { MyRanking } from './my-ranking';

function MyRankingContent() {
    const props = useMyRankingList();
    return (
        <MyRanking
            {...props}
        />
    );
}

export const MyRankingContainer = () => {
    return (
        <Suspense
            fallback={
                <div className="flex flex-1 items-center justify-center py-16">
                    <Spinner />
                </div>
            }
        >
            <MyRankingContent />
        </Suspense>
    );
};