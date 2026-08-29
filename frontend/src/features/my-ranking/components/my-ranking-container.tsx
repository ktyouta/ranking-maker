import { paths } from '@/config/paths';
import { Spinner } from '@/components';
import { Suspense, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyRankingList } from "../hooks/use-my-ranking-list";
import { MyRanking } from './my-ranking';

function MyRankingContent() {

    const navigate = useNavigate();
    const props = useMyRankingList();

    /**
     * ランキング詳細画面へ遷移
     */
    const handleSelectRanking = useCallback((id: string) => {
        navigate(paths.rankingDetail.getHref(id));
    }, [navigate]);

    return (
        <MyRanking
            {...props}
            onSelectRanking={handleSelectRanking}
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
