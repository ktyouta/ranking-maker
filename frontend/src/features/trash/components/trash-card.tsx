import { HiArrowRight } from 'react-icons/hi2';

type PropsType = {
    id: string;
    title: string;
    icon: string;
    onSelect: (id: string) => void;
};

/**
 * ゴミ箱一覧のカード
 */
export const TrashCard = (props: PropsType) => {

    const { id, title, icon, onSelect } = props;

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
                    <p className="flex items-center justify-end gap-1 text-sm font-medium text-accent hover:underline">
                        詳細を見る
                        <HiArrowRight className="size-3.5" />
                    </p>
                </div>
            </div>
        </div>
    )
};
