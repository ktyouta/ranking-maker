import { HiArrowRight } from 'react-icons/hi2';

type PropsType = {
    id: string;
    title: string;
    onSelect: (id: string) => void;
};

/**
 * ゴミ箱一覧のカード
 */
export const TrashCard = (props: PropsType) => {

    const { id, title, onSelect } = props;

    return (
        <div
            onClick={() => onSelect(id)}
            className="relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-accent/35 bg-surface shadow-sm sm:shadow-md hover:-translate-y-0.5 hover:shadow-lg sm:border-2 sm:border-accent/[40%]"
        >
            <div className="relative z-10 px-5 py-5 sm:px-6 sm:py-6">
                <div className="border-l-4 border-accent-surface pl-3">
                    <h2 className="line-clamp-2 flex min-h-[3rem] sm:min-h-[3.5rem] items-center text-base sm:text-lg font-semibold text-ink/90">
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
