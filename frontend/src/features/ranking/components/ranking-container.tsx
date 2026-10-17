import { Loading } from '@/components';
import { Suspense } from 'react';
import { useRankingList } from "../hooks/use-ranking-list";
import { Ranking } from './ranking';

function RankingContent() {
    const props = useRankingList();
    return (
        <Ranking
            {...props}
        />
    );
}

export const RankingContainer = () => {
    return (
        <Suspense
            fallback={<Loading className="h-auto w-full flex-1 py-16" />}
        >
            <RankingContent />
        </Suspense>
    );
};
