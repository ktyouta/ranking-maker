import { Spinner } from '@/components';
import { Suspense } from 'react';
import { useRankingList } from "../hooks/use-ranking-list";
import { Home } from "./home";

function HomeContent() {

    const props = useRankingList();

    return (
        <Home
            {...props}
        />
    );
}

export const HomeContainer = () => {

    return (
        <Suspense
            fallback={
                <div className="flex flex-1 items-center justify-center py-16">
                    <Spinner />
                </div>
            }
        >
            <HomeContent />
        </Suspense>
    );
};