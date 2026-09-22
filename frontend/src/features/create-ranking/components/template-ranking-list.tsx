import { MyRankingListReturnType } from '@/app/api/get-my-rankings';
import { Pagination } from '@/components';

type PropsType = {
    list: MyRankingListReturnType['list'];
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    onSelectRanking: (rankingId: string) => void;
};

export function TemplateRankingList(props: PropsType) {

    const { list, totalPages, currentPage, onPageChange, onSelectRanking } = props;

    if (list.length === 0) {
        return (
            <p className="py-8 text-center text-base text-ink-sub">
                テンプレートにできるランキングがありません
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-2 pt-1 pl-1">
            <ul className="flex flex-col gap-2">
                {list.map((ranking) => (
                    <li key={ranking.id}>
                        <button
                            type="button"
                            onClick={() => onSelectRanking(ranking.id)}
                            className="w-full truncate rounded-lg border-2 border-line px-4 py-3 text-left text-base font-semibold text-ink lg:hover:border-accent lg:hover:bg-canvas"
                        >
                            {ranking.title}
                        </button>
                    </li>
                ))}
            </ul>
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                />
            )}
        </div>
    );
}
