import { Checkbox, Spinner, Textarea, Textbox } from '@/components';
import { closestCenter, DndContext, DragEndEvent, SensorDescriptor, SensorOptions } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BaseSyntheticEvent } from 'react';
import { Control, Controller, FieldArrayWithId, FieldErrors, UseFormRegister } from 'react-hook-form';
import { HiOutlineBars3, HiOutlineChevronDown, HiOutlineChevronUp, HiOutlineTrash } from 'react-icons/hi2';
import { CreateRankingRequestType } from '../types/create-ranking-request-type';

type ItemFieldType = FieldArrayWithId<CreateRankingRequestType, 'items', 'id'>;

type PropsType = {
    errMessage: string;
    violations: { field: string; message: string }[];
    register: UseFormRegister<CreateRankingRequestType>;
    control: Control<CreateRankingRequestType>;
    errors: FieldErrors<CreateRankingRequestType>;
    items: ItemFieldType[];
    sensors: SensorDescriptor<SensorOptions>[];
    addItem: () => void;
    removeItem: (index: number) => void;
    moveItemUp: (index: number) => void;
    moveItemDown: (index: number) => void;
    handleDragEnd: (event: DragEndEvent) => void;
    back: () => void;
    isLoading: boolean;
    handleConfirm: (e?: BaseSyntheticEvent) => Promise<void>;
};

export function CreateRanking(props: PropsType) {

    const {
        errMessage,
        violations,
        register,
        control,
        errors,
        items,
        sensors,
        addItem,
        removeItem,
        moveItemUp,
        moveItemDown,
        handleDragEnd,
        back,
        isLoading,
        handleConfirm,
    } = props;

    return (
        <div className="mx-auto w-full max-w-screen-md flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {isLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10">
                    <Spinner size={40} />
                </div>
            )}
            <h1 className="text-xl font-bold text-ink">
                ランキングを作成
            </h1>
            {(errMessage || violations.length > 0) && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-base text-red-600">
                    {errMessage && <p>{errMessage}</p>}
                    {violations.length > 0 && (
                        <ul className="mt-2 list-disc pl-5">
                            {violations.map((violation) => (
                                <li key={`${violation.field}-${violation.message}`}>
                                    {violation.message}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
            <div className="mt-6 flex flex-col gap-6">
                <div>
                    <label className="mb-2 block text-base font-medium text-ink">
                        タイトル
                    </label>
                    <Textbox
                        className="w-full"
                        placeholder="例: 好きなラーメン屋ランキング"
                        registration={register('title')}
                    />
                    {errors.title?.message && (
                        <p className="mt-2 text-base text-red-500">{errors.title.message}</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Controller
                        control={control}
                        name="isPublic"
                        render={({ field }) => (
                            <Checkbox
                                checked={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    <label className="text-base text-ink">
                        公開する（他のユーザーの一覧に表示されます）
                    </label>
                </div>
                <div>
                    <label className="mb-2 block text-base font-medium text-ink">
                        メモ（任意）
                    </label>
                    <Textarea
                        className="w-full"
                        placeholder="このランキングについてのメモ"
                        registration={register('memo')}
                    />
                    {errors.memo?.message && (
                        <p className="mt-2 text-base text-red-500">{errors.memo.message}</p>
                    )}
                </div>
                <div>
                    <label className="mb-2 block text-base font-medium text-ink">
                        ランキング項目
                    </label>
                    {(errors.items?.message ?? errors.items?.root?.message) && (
                        <p className="mb-2 text-base text-red-500">
                            {errors.items?.message ?? errors.items?.root?.message}
                        </p>
                    )}
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                            <div className="flex flex-col gap-3">
                                {items.map((item, index) => (
                                    <ItemRow
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        register={register}
                                        errors={errors}
                                        canRemove={items.length > 1}
                                        isFirst={index === 0}
                                        isLast={index === items.length - 1}
                                        removeItem={removeItem}
                                        moveItemUp={moveItemUp}
                                        moveItemDown={moveItemDown}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                    <button
                        type="button"
                        className="mt-3 rounded-lg border border-dashed border-line px-4 py-2 text-base text-accent hover:bg-canvas"
                        onClick={addItem}
                    >
                        + 項目を追加
                    </button>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        className="flex-1 bg-[#E9EAED] hover:bg-[#DFE1E5] text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                        onClick={back}
                    >
                        戻る
                    </button>
                    <button
                        type="button"
                        className="flex-1 rounded-lg bg-accent px-4 py-3 text-base font-medium text-white hover:bg-accent-hover"
                        onClick={handleConfirm}
                    >
                        作成する
                    </button>
                </div>
            </div>
        </div>
    );
}

type ItemRowPropsType = {
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
function ItemRow(props: ItemRowPropsType) {

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

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="rounded-lg border border-line bg-surface p-4 shadow-sm"
        >
            <div className="flex items-start gap-3">
                <button
                    type="button"
                    className="mt-2 cursor-grab touch-none text-ink-sub"
                    aria-label="ドラッグして並び替え"
                    {...attributes}
                    {...listeners}
                >
                    <HiOutlineBars3 className="h-5 w-5" />
                </button>
                <span className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line text-base text-ink-sub">
                    {index + 1}
                </span>
                <div className="flex-1">
                    <Textbox
                        className="w-full"
                        placeholder="項目名"
                        registration={register(`items.${index}.itemName`)}
                    />
                    {errors.items?.[index]?.itemName?.message && (
                        <p className="mt-2 text-base text-red-500">{errors.items[index]?.itemName?.message}</p>
                    )}
                    <Textarea
                        className="mt-2 w-full"
                        placeholder="メモ（任意）"
                        registration={register(`items.${index}.memo`)}
                    />
                    {errors.items?.[index]?.memo?.message && (
                        <p className="mt-2 text-base text-red-500">{errors.items[index]?.memo?.message}</p>
                    )}
                </div>
                <div className="flex flex-col gap-1">
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
