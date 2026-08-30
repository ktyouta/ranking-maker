import { IoTrashBinOutline } from 'react-icons/io5';
import { TrashCard } from './trash-card';

type TrashListItem = {
    id: string;
    title: string;
    itemCount: number;
    deletedAt: string;
};

type PropsType = {
    trashList: TrashListItem[];
    onSelectTrash: (id: string) => void;
};

export const Trash = (props: PropsType) => {

    const { trashList, onSelectTrash } = props;

    return (
        <div className="w-full flex-1 px-3 py-5 sm:py-12 sm:px-6 lg:px-20">
            {trashList.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <IoTrashBinOutline className="size-16 text-accent" />
                    <p className="text-xl font-bold text-ink">
                        ゴミ箱は空です
                    </p>
                </div>
            )}
            {trashList.length > 0 && (
                <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 sm:gap-6 2xl:grid-cols-3">
                    {trashList.map((ranking) => (
                        <TrashCard
                            key={ranking.id}
                            id={ranking.id}
                            title={ranking.title}
                            itemCount={ranking.itemCount}
                            deletedAt={ranking.deletedAt}
                            onSelect={onSelectTrash}
                        />
                    ))}
                </div>
            )}
        </div>
    )
};
