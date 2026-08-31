import { LoadingOverlay, Pagination } from '@/components';
import { IoTrashBinOutline } from 'react-icons/io5';
import { TrashSearchFilter } from '../types/trash-search-filter';
import { TrashCard } from './trash-card';
import { TrashSearchBar } from './trash-search-bar';

type TrashListItem = {
    id: string;
    title: string;
    itemCount: number;
    createdAt: string;
};

type PropsType = {
    trashList: TrashListItem[];
    total: number;
    totalPages: number;
    currentPage: number;
    onSelectTrash: (id: string) => void;
    searchCondition: TrashSearchFilter;
    setSearchCondition: (condition: TrashSearchFilter) => void;
    clearSearchCondition: () => void;
    clickSearch: () => void;
    handleKeyPress: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    changePage: (page: number) => void;
    isShowOverlay: boolean;
};

export const Trash = (props: PropsType) => {

    const {
        trashList,
        total,
        totalPages,
        currentPage,
        onSelectTrash,
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
            <TrashSearchBar
                searchCondition={searchCondition}
                onChange={setSearchCondition}
                onSearch={clickSearch}
                onClear={clearSearchCondition}
                handleKeyPress={handleKeyPress}
            />
            {trashList.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <IoTrashBinOutline className="size-16 text-accent-surface" />
                    <p className="text-xl font-bold text-ink">
                        ゴミ箱は空です
                    </p>
                </div>
            )}
            {trashList.length > 0 && (
                <>
                    <p className="mb-2 text-right text-[12px] sm:text-base font-medium text-accent">全 {total} 件</p>
                    <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 sm:gap-6 2xl:grid-cols-3">
                        {trashList.map((ranking) => (
                            <TrashCard
                                key={ranking.id}
                                id={ranking.id}
                                title={ranking.title}
                                itemCount={ranking.itemCount}
                                createdAt={ranking.createdAt}
                                onSelect={onSelectTrash}
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
