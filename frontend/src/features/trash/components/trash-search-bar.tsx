import { Button, DatePicker, Textbox } from '@/components';
import { useState } from 'react';
import { IoChevronDown, IoChevronUp, IoOptionsOutline, IoSearchOutline, IoSwapVerticalOutline } from 'react-icons/io5';
import { DEFAULT_TRASH_SORT, TRASH_SORT_OPTIONS, TrashSortType } from '../constants/trash-sort-options';
import { TrashSearchFilter } from '../types/trash-search-filter';

type PropsType = {
    searchCondition: TrashSearchFilter;
    onChange: (condition: TrashSearchFilter) => void;
    onSearch: () => void;
    onClear: () => void;
    handleKeyPress: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    sort: TrashSortType;
    onChangeSort: (sort: TrashSortType) => void;
    isSelectionMode: boolean;
    onToggleSelectionMode: () => void;
};

const DATE_PICKER_CLASS = 'border-2 border-accent/70 rounded-full focus:ring-accent';

/**
 * ゴミ箱一覧の検索バー（キーワード検索＋登録日・削除日の詳細フィルター＋並び替え）
 */
export const TrashSearchBar = (props: PropsType) => {

    const { searchCondition, onChange, onSearch, onClear, handleKeyPress, sort, onChangeSort, isSelectionMode, onToggleSelectionMode } = props;

    // 詳細フィルター開閉フラグ
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    // 並び替えパネル開閉フラグ
    const [isSortOpen, setIsSortOpen] = useState(false);

    const activeCount = [
        searchCondition.createdAtFrom !== null || searchCondition.createdAtTo !== null,
        searchCondition.updatedAtFrom !== null || searchCondition.updatedAtTo !== null,
    ].filter(Boolean).length;
    // 既定以外の並び順が選ばれているか
    const isSortChanged = sort !== DEFAULT_TRASH_SORT;
    const isEmpty = searchCondition.keyword === '' && activeCount === 0 && !isSortChanged;

    return (
        <div className="mb-3 pb-4 sm:mb-6">
            <div className="flex flex-col gap-[1.1rem] sm:flex-row">
                <div className="relative flex-1">
                    <IoSearchOutline className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-sub" />
                    <Textbox
                        value={searchCondition.keyword}
                        onChange={(e) => onChange({ ...searchCondition, keyword: e.target.value })}
                        onKeyDown={handleKeyPress}
                        placeholder="キーワードで検索"
                        className="h-10 w-full rounded-full border-2 border-accent/70 pl-9 focus:ring-accent sm:h-12"
                    />
                </div>
                <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => setIsSortOpen(!isSortOpen)}
                        aria-label="並び替え"
                        className="relative flex size-10 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-surface text-accent hover:bg-accent/10 sm:hidden"
                    >
                        <IoSwapVerticalOutline className="size-4" />
                        {isSortChanged && (
                            <span className="absolute -right-1 -top-1 size-3 rounded-full bg-accent-surface shadow-sm" />
                        )}
                    </button>
                    <Button
                        colorType="accent"
                        sizeType="large"
                        onClick={() => setIsSortOpen(!isSortOpen)}
                        className="relative hidden h-10 items-center gap-1.5 whitespace-nowrap font-semibold rounded-full border border-accent/40 bg-surface text-sm text-accent hover:bg-accent/10 sm:flex sm:h-12 sm:text-base"
                    >
                        <IoSwapVerticalOutline className="size-4" />
                        並び替え
                        {isSortOpen ? <IoChevronUp className="size-4" /> : <IoChevronDown className="size-4" />}
                        {isSortChanged && (
                            <span className="absolute -right-1.5 -top-1.5 size-3.5 rounded-full bg-accent-surface shadow-sm" />
                        )}
                    </Button>
                    {/* sm未満: ボタンを横一列に収めるためアイコンのみ */}
                    <button
                        type="button"
                        onClick={() => setIsDetailOpen(!isDetailOpen)}
                        aria-label="絞り込み"
                        className="relative flex size-10 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-surface text-accent hover:bg-accent/10 sm:hidden"
                    >
                        <IoOptionsOutline className="size-4" />
                        {activeCount > 0 && (
                            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-accent-surface text-[11px] font-bold text-white shadow-sm">
                                {activeCount}
                            </span>
                        )}
                    </button>
                    {/* sm以上: テキスト付きボタン */}
                    <Button
                        colorType="accent"
                        sizeType="large"
                        onClick={() => setIsDetailOpen(!isDetailOpen)}
                        className="relative hidden h-10 items-center gap-1.5 whitespace-nowrap font-semibold rounded-full border border-accent/40 bg-surface text-sm text-accent hover:bg-accent/10 sm:flex sm:h-12 sm:text-base"
                    >
                        <IoOptionsOutline className="size-4" />
                        絞り込み
                        {isDetailOpen ? <IoChevronUp className="size-4" /> : <IoChevronDown className="size-4" />}
                        {activeCount > 0 && (
                            <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-accent-surface text-[11px] font-bold text-white shadow-sm">
                                {activeCount}
                            </span>
                        )}
                    </Button>
                    <Button
                        colorType="accent"
                        sizeType="large"
                        onClick={onClear}
                        disabled={isEmpty}
                        className="flex h-10 items-center justify-center whitespace-nowrap rounded-full bg-accent/10 text-sm font-semibold text-accent shadow-none ring-1 ring-inset ring-accent/40 hover:bg-accent/20 disabled:opacity-50 sm:h-12 sm:px-9 sm:text-base"
                    >
                        クリア
                    </Button>
                    <Button
                        colorType="accent"
                        sizeType="large"
                        onClick={onSearch}
                        className="flex h-10 items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold shadow-md sm:h-12 sm:px-9 sm:text-base"
                    >
                        検索
                    </Button>
                    {!isSelectionMode && (
                        <Button
                            colorType="accent"
                            sizeType="large"
                            onClick={onToggleSelectionMode}
                            className="h-10 items-center gap-1.5 whitespace-nowrap rounded-full border border-accent/40 bg-white text-sm font-semibold text-accent shadow-sm hover:bg-accent/10 flex lg:h-12 lg:px-9 lg:text-base"
                        >
                            一括選択
                        </Button>
                    )}
                </div>
            </div>
            {isSortOpen && (
                <div className="mt-2 grid grid-cols-3 gap-2 pt-4 sm:mt-4 sm:flex sm:flex-wrap">
                    {TRASH_SORT_OPTIONS.map((option) => (
                        <Button
                            key={option.value}
                            colorType="accent"
                            sizeType="medium"
                            onClick={() => onChangeSort(option.value)}
                            aria-pressed={sort === option.value}
                            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm sm:text-base font-semibold shadow-none ${sort === option.value ?
                                `border-accent bg-accent/15 text-accent hover:bg-accent/25` :
                                `border-accent/40 bg-surface text-accent hover:bg-accent/10`}`}
                        >
                            {option.label}
                        </Button>
                    ))}
                </div>
            )}
            {isDetailOpen && (
                <div className="mt-2 sm:mt-4 flex flex-col gap-3 pt-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <span className="w-20 shrink-0 text-[12px] sm:text-base font-semibold text-accent">登録日</span>
                        <div className="flex flex-1 items-center gap-2">
                            <DatePicker
                                value={searchCondition.createdAtFrom}
                                onChange={(d) => onChange({ ...searchCondition, createdAtFrom: d })}
                                placeholder="開始日"
                                className={DATE_PICKER_CLASS}
                            />
                            <span className="shrink-0 text-ink-sub">〜</span>
                            <DatePicker
                                value={searchCondition.createdAtTo}
                                onChange={(d) => onChange({ ...searchCondition, createdAtTo: d })}
                                placeholder="終了日"
                                className={DATE_PICKER_CLASS}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <span className="w-20 shrink-0 text-[12px] sm:text-base font-semibold text-accent">削除日</span>
                        <div className="flex flex-1 items-center gap-2">
                            <DatePicker
                                value={searchCondition.updatedAtFrom}
                                onChange={(d) => onChange({ ...searchCondition, updatedAtFrom: d })}
                                placeholder="開始日"
                                className={DATE_PICKER_CLASS}
                            />
                            <span className="shrink-0 text-ink-sub">〜</span>
                            <DatePicker
                                value={searchCondition.updatedAtTo}
                                onChange={(d) => onChange({ ...searchCondition, updatedAtTo: d })}
                                placeholder="終了日"
                                className={DATE_PICKER_CLASS}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
