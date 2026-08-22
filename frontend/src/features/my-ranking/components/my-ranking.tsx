import { Badge } from '@/components';
import { IoTrophyOutline } from 'react-icons/io5';
import { PUBLIC_STATUS } from '../constants/public-status';

type RankingListItem = {
    id: string;
    title: string;
    userName: string;
    createdAt: string;
    publicStatus: number;
    publicStatusName: string;
};

type PropsType = {
    rankingList: RankingListItem[];
};

export const MyRanking = (props: PropsType) => {

    const { rankingList } = props;

    return (
        <div className="mx-auto w-full max-w-screen-xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {rankingList.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <IoTrophyOutline className="size-16 text-accent" />
                    <p className="text-xl font-bold text-ink">
                        まだランキングがありません
                    </p>
                </div>
            )}
            {rankingList.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                    {rankingList.map((ranking) => (
                        <div
                            key={ranking.id}
                            className="rounded-lg bg-surface p-5 shadow-sm"
                        >
                            <Badge
                                label={ranking.publicStatusName}
                                bgColor={ranking.publicStatus === PUBLIC_STATUS.PUBLIC ? 'bg-accent' : 'bg-ink-sub'}
                            />
                            <h2 className="mt-2 line-clamp-2 text-lg font-bold text-ink">
                                {ranking.title}
                            </h2>
                            <p className="mt-3 text-base text-ink-sub">
                                {ranking.userName}
                            </p>
                            <p className="mt-1 text-base text-ink-sub">
                                {ranking.createdAt}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
};