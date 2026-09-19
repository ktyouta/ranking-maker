import { Dialog, LoadingOverlay, Pagination, ScrollToTopButton } from '@/components';
import { IoTrashBinOutline } from 'react-icons/io5';
import { TrashSearchFilter } from '../types/trash-search-filter';
import { BulkActionBar } from './bulk-action-bar';
import { TrashCard } from './trash-card';
import { TrashSearchBar } from './trash-search-bar';

type TrashListItem = {
    id: string;
    title: string;
    icon: string;
    itemCount: number;
    updatedAt: string;
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
    isSelectionMode: boolean;
    selectedIdSet: Set<string>;
    selectedCount: number;
    onToggleSelectionMode: () => void;
    onToggleSelect: (id: string) => void;
    isAllSelectedOnPage: boolean;
    onToggleSelectAllOnPage: () => void;
    isBulkRestoreDialogOpen: boolean;
    onClickBulkRestore: () => void;
    onCancelBulkRestore: () => void;
    onConfirmBulkRestore: () => void;
    isBulkRestoring: boolean;
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
        isSelectionMode,
        selectedIdSet,
        selectedCount,
        onToggleSelectionMode,
        onToggleSelect,
        isAllSelectedOnPage,
        onToggleSelectAllOnPage,
        isBulkRestoreDialogOpen,
        onClickBulkRestore,
        onCancelBulkRestore,
        onConfirmBulkRestore,
        isBulkRestoring,
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
                isSelectionMode={isSelectionMode}
                onToggleSelectionMode={onToggleSelectionMode}
            />
            <BulkActionBar
                isSelectionMode={isSelectionMode}
                selectedCount={selectedCount}
                isAllSelectedOnPage={isAllSelectedOnPage}
                isRestoring={isBulkRestoring}
                onToggleSelectionMode={onToggleSelectionMode}
                onToggleSelectAllOnPage={onToggleSelectAllOnPage}
                onClickBulkRestore={onClickBulkRestore}
            />
            {trashList.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <IoTrashBinOutline className="size-10 sm:size-16 text-accent-surface" />
                    <p className="text-base sm:text-xl font-bold text-ink">
                        ゴミ箱は空です
                    </p>
                </div>
            )}
            {trashList.length > 0 && (
                <>
                    <p className="mb-2 text-right text-[12px] sm:text-base font-medium text-accent">全 {total} 件</p>
                    <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2 sm:gap-x-9 sm:gap-y-10 2xl:grid-cols-3">
                        {trashList.map((ranking) => (
                            <TrashCard
                                key={ranking.id}
                                id={ranking.id}
                                title={ranking.title}
                                icon={ranking.icon}
                                itemCount={ranking.itemCount}
                                updatedAt={ranking.updatedAt}
                                onSelect={onSelectTrash}
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
                isOpen={isBulkRestoreDialogOpen}
                onClose={onCancelBulkRestore}
                title="ランキングの一括復元"
                size="small"
            >
                <div className="space-y-4">
                    <p className="text-base text-ink">
                        選択中の{selectedCount}件を復元しますか？<br />
                        復元後はランキング一覧から参照できます。
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            className="rounded-full border-2 border-accent/30 bg-surface px-6 py-2 text-base font-medium text-ink-sub hover:bg-canvas"
                            onClick={onCancelBulkRestore}
                        >
                            キャンセル
                        </button>
                        <button
                            type="button"
                            className="rounded-full bg-accent-surface px-6 py-2 text-base font-medium text-white hover:bg-accent-surface-hover"
                            onClick={onConfirmBulkRestore}
                        >
                            復元
                        </button>
                    </div>
                </div>
            </Dialog>
        </div>
    )
};
