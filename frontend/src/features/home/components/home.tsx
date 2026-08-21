import { IoTrophyOutline } from 'react-icons/io5';

type RankingListItem = {
    id: string;
    title: string;
    userName: string;
    createdAt: string;
};

type PropsType = {
    rankingList: RankingListItem[];
};

export const Home = (props: PropsType) => {

    const { rankingList } = props;

    return (
        <div className="mx-auto w-full max-w-screen-xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {rankingList.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <IoTrophyOutline className="size-16 text-accent" />
                    <p className="text-xl font-bold text-ink">
                        まだ公開ランキングがありません
                    </p>
                    <p className="text-lg text-ink-sub">
                        あなたの「好き」を最初のランキングにしてみませんか？
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
                            <h2 className="line-clamp-2 text-lg font-bold text-ink">
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