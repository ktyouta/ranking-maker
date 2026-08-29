import { IoTrophyOutline } from 'react-icons/io5';
import { RankingCard } from './ranking-card';

type RankingListItem = {
    id: string;
    title: string;
    createdAt: string;
    itemCount: number;
};

type PropsType = {
    rankingList: RankingListItem[];
};

export const MyRanking = (props: PropsType) => {

    const { rankingList } = props;

    return (
        <div className="w-full flex-1 px-3 py-5 sm:py-12 sm:px-6 lg:px-20">
            {rankingList.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <IoTrophyOutline className="size-16 text-accent" />
                    <p className="text-xl font-bold text-ink">
                        まだランキングがありません
                    </p>
                </div>
            )}
            {rankingList.length > 0 && (
                <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 sm:gap-6 2xl:grid-cols-3">
                    {rankingList.map((ranking) => (
                        <RankingCard
                            key={ranking.id}
                            title={ranking.title}
                            createdAt={ranking.createdAt}
                            itemCount={ranking.itemCount}
                        />
                    ))}
                </div>
            )}
        </div>
    )
};
