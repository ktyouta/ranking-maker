import { Checkbox } from '@/components';
import { HiArrowRight, HiOutlineClock, HiOutlineListBullet, HiOutlineStar, HiStar } from 'react-icons/hi2';

type PropsType = {
    id: string;
    title: string;
    icon: string;
    itemCount: number;
    updatedAt: string;
    isFavorite: boolean;
    onSelect: (id: string) => void;
    onToggleFavorite: (id: string, isFavorite: boolean) => void;
    isSelectionMode?: boolean;
    isSelected?: boolean;
    onToggleSelect?: (id: string) => void;
};

/**
 * ランキング一覧のカード
 */
export const RankingCard = (props: PropsType) => {

    const {
        id, title, icon, itemCount, updatedAt, isFavorite, onSelect, onToggleFavorite,
        isSelectionMode = false, isSelected = false, onToggleSelect,
    } = props;

    return (
        <div
            onClick={() => onSelect(id)}
            className="relative isolate flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-accent/35 bg-surface shadow-sm sm:shadow-md sm:hover:-translate-y-0.5 sm:hover:shadow-lg sm:border-2 sm:border-accent/[40%]"
        >
            {isSelectionMode && (
                <div className="absolute left-3 sm:left-4 top-2 sm:top-3 z-10 flex size-9 items-center justify-center">
                    <Checkbox
                        checked={isSelected}
                        onChange={() => onToggleSelect?.(id)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={isSelected ? '選択を解除する' : '選択する'}
                        size="large"
                    />
                </div>
            )}
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(id, isFavorite);
                }}
                aria-label={isFavorite ? 'お気に入りから外す' : 'お気に入りに登録する'}
                className="absolute right-3 sm:right-4 top-2 sm:top-3 flex size-9 items-center justify-center"
            >
                {isFavorite
                    ? <HiStar className="size-5 sm:size-7 text-amber-400" />
                    : <HiOutlineStar className="size-5 sm:size-7 text-gray-400" />
                }
            </button>
            <div className="flex items-stretch gap-5 px-5 py-5 sm:gap-7 sm:px-6 sm:py-6">
                <div className="flex w-[70px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent-surface/15 text-5xl sm:w-[90px] sm:text-6xl">
                    {icon}
                </div>
                <div className="flex flex-1 flex-col justify-between gap-1 sm:gap-2">
                    <h2 className="line-clamp-2 flex min-h-[3rem] items-center text-base font-semibold text-ink/90 sm:min-h-[3.5rem] sm:text-lg">
                        {title}
                    </h2>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="flex items-center gap-1 rounded-full border border-accent/30 px-3 py-0.5 text-xs font-medium text-accent sm:px-5 sm:py-1 sm:text-sm">
                                <HiOutlineListBullet className="size-3 shrink-0 sm:size-3.5" />
                                {itemCount}個
                            </span>
                            <span className="flex items-center gap-1 rounded-full border border-accent/30 px-3 py-0.5 text-xs font-medium text-accent sm:px-5 sm:py-1 sm:text-sm">
                                <HiOutlineClock className="size-3 shrink-0 sm:size-3.5" />
                                {updatedAt}
                            </span>
                        </div>
                        <p className="flex items-center gap-1 text-xs font-medium text-accent sm:hover:underline sm:text-sm">
                            詳細を見る
                            <HiArrowRight className="size-3 sm:size-3.5" />
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
};
