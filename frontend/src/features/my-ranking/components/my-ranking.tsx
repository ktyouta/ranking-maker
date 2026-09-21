import { Dialog, LoadingOverlay, Pagination, ScrollToTopButton } from '@/components';
import { IoTrophyOutline } from 'react-icons/io5';
import { MyRankingSortType } from '../constants/my-ranking-sort-options';
import { MyRankingSearchFilter } from '../types/my-ranking-search-filter';
import { BulkActionBar } from './bulk-action-bar';
import { MyRankingSearchBar } from './my-ranking-search-bar';
import { RankingCard } from './ranking-card';

type RankingListItem = {
    id: string;
    title: string;
    icon: string;
    itemCount: number;
    updatedAt: string;
    isFavorite: boolean;
};

type PropsType = {
    rankingList: RankingListItem[];
    total: number;
    totalPages: number;
    currentPage: number;
    onSelectRanking: (id: string) => void;
    onToggleFavorite: (id: string, isFavorite: boolean) => void;
    searchCondition: MyRankingSearchFilter;
    setSearchCondition: (condition: MyRankingSearchFilter) => void;
    clearSearchCondition: () => void;
    clickSearch: () => void;
    handleKeyPress: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    changePage: (page: number) => void;
    sort: MyRankingSortType;
    onChangeSort: (sort: MyRankingSortType) => void;
    isShowOverlay: boolean;
    isSelectionMode: boolean;
    selectedIdSet: Set<string>;
    selectedCount: number;
    onToggleSelectionMode: () => void;
    onToggleSelect: (id: string) => void;
    isAllSelectedOnPage: boolean;
    onToggleSelectAllOnPage: () => void;
    onExportCsv: () => void;
    isExporting: boolean;
    isBulkDeleteDialogOpen: boolean;
    onClickBulkDelete: () => void;
    onCancelBulkDelete: () => void;
    onConfirmBulkDelete: () => void;
    isBulkDeleting: boolean;
};

export const MyRanking = (props: PropsType) => {

    const {
        rankingList,
        total,
        totalPages,
        currentPage,
        onSelectRanking,
        onToggleFavorite,
        searchCondition,
        setSearchCondition,
        clearSearchCondition,
        clickSearch,
        handleKeyPress,
        changePage,
        sort,
        onChangeSort,
        isShowOverlay,
        isSelectionMode,
        selectedIdSet,
        selectedCount,
        onToggleSelectionMode,
        onToggleSelect,
        isAllSelectedOnPage,
        onToggleSelectAllOnPage,
        onExportCsv,
        isExporting,
        isBulkDeleteDialogOpen,
        onClickBulkDelete,
        onCancelBulkDelete,
        onConfirmBulkDelete,
        isBulkDeleting,
    } = props;

    return (
        <div className="relative w-full flex-1 px-3 py-5 sm:py-12 sm:px-6 lg:px-20">
            {isShowOverlay && <LoadingOverlay />}
            {!isSelectionMode && (
                <MyRankingSearchBar
                    searchCondition={searchCondition}
                    onChange={setSearchCondition}
                    onSearch={clickSearch}
                    onClear={clearSearchCondition}
                    handleKeyPress={handleKeyPress}
                    sort={sort}
                    onChangeSort={onChangeSort}
                    onToggleSelectionMode={onToggleSelectionMode}
                />
            )}
            <BulkActionBar
                isSelectionMode={isSelectionMode}
                selectedCount={selectedCount}
                isExporting={isExporting}
                isDeleting={isBulkDeleting}
                onToggleSelectionMode={onToggleSelectionMode}
                isAllSelectedOnPage={isAllSelectedOnPage}
                onToggleSelectAllOnPage={onToggleSelectAllOnPage}
                onExportCsv={onExportCsv}
                onClickBulkDelete={onClickBulkDelete}
            />
            {rankingList.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <IoTrophyOutline className="size-10 sm:size-16 text-accent-surface" />
                    <p className="text-base sm:text-xl font-bold text-ink">
                        まだランキングがありません
                    </p>
                </div>
            )}
            {rankingList.length > 0 && (
                <>
                    <p className="mb-2 text-right text-[12px] sm:text-base font-medium text-accent">全 {total} 件</p>
                    <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2 sm:gap-x-9 sm:gap-y-10 2xl:grid-cols-3">
                        {rankingList.map((ranking) => (
                            <RankingCard
                                key={ranking.id}
                                id={ranking.id}
                                title={ranking.title}
                                icon={ranking.icon}
                                itemCount={ranking.itemCount}
                                updatedAt={ranking.updatedAt}
                                isFavorite={ranking.isFavorite}
                                onSelect={onSelectRanking}
                                onToggleFavorite={onToggleFavorite}
                                isSelectionMode={isSelectionMode}
                                isSelected={selectedIdSet.has(ranking.id)}
                                onToggleSelect={onToggleSelect}
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
            <ScrollToTopButton />
            <Dialog
                isOpen={isBulkDeleteDialogOpen}
                onClose={onCancelBulkDelete}
                title="ランキングの一括削除"
                size="small"
            >
                <div className="space-y-4">
                    <p className="text-base text-ink">
                        選択中の{selectedCount}件を削除しますか？<br />
                        削除後もゴミ箱からいつでも復元できます。
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            className="rounded-full border-2 border-accent/30 bg-surface px-6 py-2 text-base font-medium text-ink-sub hover:bg-canvas"
                            onClick={onCancelBulkDelete}
                        >
                            キャンセル
                        </button>
                        <button
                            type="button"
                            className="rounded-full bg-danger-fill px-6 py-2 text-base font-medium text-white hover:bg-danger-fill-hover"
                            onClick={onConfirmBulkDelete}
                        >
                            削除
                        </button>
                    </div>
                </div>
            </Dialog>
        </div>
    )
};
