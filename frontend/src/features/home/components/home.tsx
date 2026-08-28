import { IoCalendarOutline, IoListOutline, IoPersonOutline, IoTrophyOutline } from 'react-icons/io5';

type RankingListItem = {
    id: string;
    title: string;
    userName: string;
    createdAt: string;
    itemCount: number;
};

type PropsType = {
    rankingList: RankingListItem[];
};

export const Home = (props: PropsType) => {

    const { rankingList } = props;

    return (
        <div className="w-full flex-1 px-3 py-5 sm:py-12 sm:px-6 lg:px-20">
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
                <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 sm:gap-6 2xl:grid-cols-3">
                    {rankingList.map((ranking) => (
                        <div
                            key={ranking.id}
                            className="flex flex-col overflow-hidden rounded-xl border border-accent/30 bg-surface shadow-sm hover:-translate-y-0.5 hover:shadow-sm"
                        >
                            <div className="border-b border-line bg-gradient-to-r from-accent/10 to-transparent px-5 py-2.5">
                                <span className="flex size-9 items-center justify-center rounded-full bg-accent text-white shadow-sm">
                                    <IoTrophyOutline className="size-5" />
                                </span>
                            </div>
                            <div className="px-6 py-4">
                                <h2 className="line-clamp-2 flex min-h-[3.5rem] items-center text-lg font-bold text-ink">
                                    {ranking.title}
                                </h2>
                                <p className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-base font-semibold text-accent">
                                    <IoListOutline className="size-4" />
                                    全 {ranking.itemCount} 項目
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-2.5">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-line px-3 py-1 text-base text-ink-sub">
                                    <IoPersonOutline className="size-4" />
                                    {ranking.userName}
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-line px-3 py-1 text-base text-ink-sub">
                                    <IoCalendarOutline className="size-4" />
                                    作成日 {ranking.createdAt}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
};