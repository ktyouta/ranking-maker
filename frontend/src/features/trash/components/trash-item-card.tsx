import { HiOutlineDocumentText } from 'react-icons/hi2';

const TOP_RANK_COUNT = 3;

export type ItemType = {
    id: string;
    order: number;
    itemName: string;
    itemMemo: string;
};

type PropsType = {
    item: ItemType;
    index: number;
    onClickMemo: (item: ItemType) => void;
};

/**
 * ゴミ箱のランキング詳細の項目カード1件分の表示
 */
export function TrashItemCard(props: PropsType) {

    const { item, index, onClickMemo } = props;

    const isTopRank = index < TOP_RANK_COUNT;
    const rankBadgeClass = index === 0
        ? 'bg-rank-gold text-white'
        : index === 1
            ? 'bg-rank-silver text-white'
            : index === 2
                ? 'bg-rank-bronze text-white'
                : 'bg-accent/15 text-accent';
    const cardBorderClass = index === 0
        ? 'border-rank-gold/60'
        : index === 1
            ? 'border-rank-silver/60'
            : index === 2
                ? 'border-rank-bronze/60'
                : 'border-accent/60';

    return (
        <div
            className={`flex items-center gap-3 rounded-2xl border bg-surface sm:gap-4 ${cardBorderClass} p-4 sm:p-6 shadow-sm`}
        >
            <span
                className={`flex shrink-0 items-center justify-center rounded-full font-bold shadow-sm ${rankBadgeClass} ${isTopRank ? 'mt-1 size-10 text-lg sm:size-12 sm:text-xl' : 'size-8 text-sm'}`}
            >
                {item.order}
            </span>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                <p className={`break-words font-semibold text-ink ${isTopRank ? 'text-lg sm:text-xl' : 'text-base'}`}>
                    {item.itemName || <span className="text-ink-sub">項目未設定</span>}
                </p>
                <button
                    type="button"
                    onClick={() => onClickMemo(item)}
                    className="shrink-0 rounded-full bg-accent/15 p-2 text-accent hover:bg-accent/25"
                    aria-label={`${item.itemName || '項目'}のメモを見る`}
                >
                    <HiOutlineDocumentText className="size-5 sm:size-6" />
                </button>
            </div>
        </div>
    );
}
