import { LoadingOverlay, Pagination } from '@/components';
import { IoTrophyOutline } from 'react-icons/io5';
import { MyRankingSearchFilter } from '../types/my-ranking-search-filter';
import { MyRankingSearchBar } from './my-ranking-search-bar';
import { RankingCard } from './ranking-card';

type RankingListItem = {
    id: string;
    title: string;
    createdAt: string;
    itemCount: number;
};

type PropsType = {
    rankingList: RankingListItem[];
    total: number;
    totalPages: number;
    currentPage: number;
    onSelectRanking: (id: string) => void;
    searchCondition: MyRankingSearchFilter;
    setSearchCondition: (condition: MyRankingSearchFilter) => void;
    clearSearchCondition: () => void;
    clickSearch: () => void;
    handleKeyPress: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    changePage: (page: number) => void;
    isShowOverlay: boolean;
};

export const MyRanking = (props: PropsType) => {

    const {
        rankingList,
        total,
        totalPages,
        currentPage,
        onSelectRanking,
        searchCondition,
        setSearchCondition,
        clearSearchCondition,
        clickSearch,
        handleKeyPress,
        changePage,
        isShowOverlay,
    } = props;

    return (
        <div className="relative w-full flex-1 px-3 py-5 sm:py-12 sm:px-6 lg:px-20">
            {isShowOverlay && <LoadingOverlay />}
            <MyRankingSearchBar
                searchCondition={searchCondition}
                onChange={setSearchCondition}
                onSearch={clickSearch}
                onClear={clearSearchCondition}
                handleKeyPress={handleKeyPress}
            />
            {rankingList.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <IoTrophyOutline className="size-16 text-accent" />
                    <p className="text-xl font-bold text-ink">
                        まだランキングがありません
                    </p>
                </div>
            )}
            {rankingList.length > 0 && (
                <>
                    <p className="mb-2 text-right text-[12px] sm:text-base font-medium text-accent">全 {total} 件</p>
                    <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 sm:gap-6 2xl:grid-cols-3">
                        {rankingList.map((ranking) => (
                            <RankingCard
                                key={ranking.id}
                                id={ranking.id}
                                title={ranking.title}
                                createdAt={ranking.createdAt}
                                itemCount={ranking.itemCount}
                                onSelect={onSelectRanking}
                            />
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={changePage}
                        />
                    )}
                </>
            )}
        </div>
    )
};
