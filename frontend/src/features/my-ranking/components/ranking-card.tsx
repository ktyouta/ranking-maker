import { HiArrowRight } from 'react-icons/hi2';
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
            className="flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-accent/35 bg-surface shadow-sm sm:shadow-md hover:-translate-y-0.5 hover:shadow-lg sm:border-2 sm:border-accent/[40%]"
        >
            <div className="flex items-center justify-between gap-2 bg-accent/[12%] px-5 py-3 sm:py-5">
                <span className="flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-full bg-accent-surface text-white shadow-md">
                    <IoTrophyOutline className="size-4 sm:size-5" />
                </span>
                <div className="flex flex-nowrap items-center justify-end gap-1.5 sm:gap-2">
                    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-accent bg-surface px-2 py-1 text-[12px] font-semibold text-accent sm:gap-1.5 sm:border-2 sm:px-3 sm:text-base">
                        <IoListOutline className="size-3.5 sm:size-4" />
                        全 {itemCount} 項目
                    </span>
                    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-accent bg-surface px-2 py-1 text-[12px] font-semibold text-accent sm:gap-1.5 sm:border-2 sm:px-3 sm:text-base">
                        <IoCalendarOutline className="size-3.5 sm:size-4" />
                        作成日 {createdAt}
                    </span>
                </div>
            </div>
            <div className="border-t border-line py-2 pl-5 pr-6 sm:py-4">
                <div className="border-l-4 border-accent-surface pl-3">
                    <h2 className="line-clamp-2 flex min-h-[3rem] sm:min-h-[3.5rem] items-center text-lg font-bold text-ink">
                        {title}
                    </h2>
                    <p className="mt-1 sm:mt-2 flex items-center justify-end gap-1 text-sm font-medium text-accent hover:underline">
                        詳細を見る
                        <HiArrowRight className="size-3.5" />
                    </p>
                </div>
            </div>
        </div>
    )
};
