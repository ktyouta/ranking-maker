import { HiArrowRight, HiOutlineClock, HiOutlineListBullet } from 'react-icons/hi2';

type PropsType = {
    id: string;
    title: string;
    icon: string;
    itemCount: number;
    updatedAt: string;
    onSelect: (id: string) => void;
};

/**
 * ランキング一覧のカード
 */
export const RankingCard = (props: PropsType) => {

    const { id, title, icon, itemCount, updatedAt, onSelect } = props;

    return (
        <div
            onClick={() => onSelect(id)}
            className="relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-accent/35 bg-surface shadow-sm sm:shadow-md hover:-translate-y-0.5 hover:shadow-lg sm:border-2 sm:border-accent/[40%]"
        >
            <div className="relative z-10 flex items-stretch gap-4 px-5 py-5 sm:gap-6 sm:px-6 sm:py-6">
                <div className="flex w-19 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent-surface/15 text-5xl sm:w-20 sm:text-6xl">
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
                        <p className="flex items-center gap-1 text-xs font-medium text-accent hover:underline sm:text-sm">
                            詳細を見る
                            <HiArrowRight className="size-3 sm:size-3.5" />
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
};
