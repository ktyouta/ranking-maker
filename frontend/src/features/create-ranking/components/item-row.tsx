import { Textarea, Textbox } from '@/components';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FieldArrayWithId, FieldErrors, UseFormRegister } from 'react-hook-form';
import { HiOutlineBars3, HiOutlineChevronDown, HiOutlineChevronUp, HiOutlineTrash } from 'react-icons/hi2';
import { CreateRankingRequestType } from '../types/create-ranking-request-type';

export type ItemFieldType = FieldArrayWithId<CreateRankingRequestType, 'items', 'id'>;

type PropsType = {
    item: ItemFieldType;
    index: number;
    register: UseFormRegister<CreateRankingRequestType>;
    errors: FieldErrors<CreateRankingRequestType>;
    canRemove: boolean;
    isFirst: boolean;
    isLast: boolean;
    removeItem: (index: number) => void;
    moveItemUp: (index: number) => void;
    moveItemDown: (index: number) => void;
};

/**
 * ランキング項目の入力行（ドラッグ&ドロップ・上下移動・削除に対応）
 */
export function ItemRow(props: PropsType) {

    const {
        item,
        index,
        register,
        errors,
        canRemove,
        isFirst,
        isLast,
        removeItem,
        moveItemUp,
        moveItemDown,
    } = props;

    // ドラッグ時の見た目（位置・変形）のみ担当。並び替え自体は呼び出し元のコールバックが行う
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    // 上位3位はメダルカラー、それ以外はニュートラルなバッジにする
    const rankBadgeClass = index === 0
        ? 'bg-rank-gold text-white'
        : index === 1
            ? 'bg-rank-silver text-white'
            : index === 2
                ? 'bg-rank-bronze text-white'
                : 'bg-accent/15 text-accent';

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group animate-fade-in rounded-xl border-2 border-accent/20 bg-surface p-5 shadow-sm"
        >
            <div className="flex items-start gap-3">
                <div className="flex-1">
                    <div className="flex items-start gap-3">
                        <button
                            type="button"
                            className="mt-2 cursor-grab touch-none text-ink-sub opacity-40 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                            aria-label="ドラッグして並び替え"
                            {...attributes}
                            {...listeners}
                        >
                            <HiOutlineBars3 className="h-5 w-5" />
                        </button>
                        <span className={`mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base font-bold shadow-sm ${rankBadgeClass}`}>
                            {index + 1}
                        </span>
                        <div className="flex-1">
                            <Textbox
                                className="h-auto w-full rounded-none border-0 border-b-2 border-line bg-transparent px-1 py-1.5 text-lg font-semibold text-ink focus:border-accent focus:ring-0"
                                placeholder="項目名"
                                registration={register(`items.${index}.itemName`)}
                            />
                            {errors.items?.[index]?.itemName?.message && (
                                <p className="mt-2 text-base text-red-500">{errors.items[index]?.itemName?.message}</p>
                            )}
                        </div>
                    </div>
                    <Textarea
                        className="mt-3 w-full rounded-lg border border-line bg-canvas/60 px-3 py-2 text-base text-ink-sub focus:border-accent focus:bg-canvas focus:ring-0"
                        placeholder="メモ（任意）"
                        registration={register(`items.${index}.memo`)}
                    />
                    {errors.items?.[index]?.memo?.message && (
                        <p className="mt-2 text-base text-red-500">{errors.items[index]?.memo?.message}</p>
                    )}
                </div>
                <div className="flex flex-col gap-1 opacity-40 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <button
                        type="button"
                        className="rounded p-1 text-ink-sub hover:bg-canvas disabled:opacity-30"
                        aria-label="1つ上に移動"
                        disabled={isFirst}
                        onClick={() => moveItemUp(index)}
                    >
                        <HiOutlineChevronUp className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        className="rounded p-1 text-ink-sub hover:bg-canvas disabled:opacity-30"
                        aria-label="1つ下に移動"
                        disabled={isLast}
                        onClick={() => moveItemDown(index)}
                    >
                        <HiOutlineChevronDown className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        className="rounded p-1 text-ink-sub hover:bg-canvas disabled:opacity-30"
                        aria-label="この項目を削除"
                        disabled={!canRemove}
                        onClick={() => removeItem(index)}
                    >
                        <HiOutlineTrash className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
