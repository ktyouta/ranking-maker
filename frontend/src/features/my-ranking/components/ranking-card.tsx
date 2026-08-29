import { IoCalendarOutline, IoListOutline, IoTrophyOutline } from 'react-icons/io5';

type PropsType = {
    id: string;
    title: string;
    createdAt: string;
    itemCount: number;
    onSelect: (id: string) => void;
};

/**
 * ランキング一覧のカード
 */
export const RankingCard = (props: PropsType) => {

    const { id, title, createdAt, itemCount, onSelect } = props;

    return (
        <div
            onClick={() => onSelect(id)}
            className="flex cursor-pointer flex-col overflow-hidden rounded-xl border border-accent/30 bg-surface shadow-sm hover:-translate-y-0.5 hover:shadow-sm"
        >
            <div className="flex items-center justify-between border-b border-line bg-gradient-to-r from-accent/10 to-transparent px-5 py-2.5">
                <span className="flex size-9 items-center justify-center rounded-full bg-accent text-white shadow-sm">
                    <IoTrophyOutline className="size-5" />
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-base font-semibold text-accent">
                    <IoListOutline className="size-4" />
                    全 {itemCount} 項目
                </span>
            </div>
            <div className="px-6 py-4">
                <h2 className="line-clamp-2 flex min-h-[3.5rem] items-center text-lg font-bold text-ink">
                    {title}
                </h2>
            </div>
            <div className="border-t border-line px-5 py-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-line px-3 py-1 text-base text-ink-sub">
                    <IoCalendarOutline className="size-4" />
                    作成日 {createdAt}
                </span>
            </div>
        </div>
    )
};
