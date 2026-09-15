import { Loading } from '@/components';
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
            fallback={<Loading className="h-auto w-full flex-1 py-16" />}
        >
            <MyRankingContent />
        </Suspense>
    );
};
