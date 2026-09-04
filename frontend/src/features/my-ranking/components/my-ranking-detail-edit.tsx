import { LoadingOverlay, ScrollToTopButton, Textarea, Textbox } from '@/components';
import { closestCenter, DndContext, DragEndEvent, SensorDescriptor, SensorOptions } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { BaseSyntheticEvent } from 'react';
import { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';
import { IoTrophyOutline } from 'react-icons/io5';
import { UpdateMyRankingRequestType } from '../types/update-my-ranking-request-type';
import { ItemFieldType, ItemRow } from './item-row';

type PropsType = {
    title: string;
    errMessage: string;
    violations: { field: string; message: string }[];
    register: UseFormRegister<UpdateMyRankingRequestType>;
    control: Control<UpdateMyRankingRequestType>;
    errors: FieldErrors<UpdateMyRankingRequestType>;
    items: ItemFieldType[];
    sensors: SensorDescriptor<SensorOptions>[];
    addItem: () => void;
    removeItem: (index: number) => void;
    moveItemUp: (index: number) => void;
    moveItemDown: (index: number) => void;
    handleDragEnd: (event: DragEndEvent) => void;
    onCancel: () => void;
    isLoading: boolean;
    onSave: (e?: BaseSyntheticEvent) => Promise<void>;
};

/**
 * ランキング詳細の編集モードフォーム
 */
export function MyRankingDetailEdit(props: PropsType) {

    const {
        title,
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
        onCancel,
        isLoading,
        onSave,
    } = props;

    return (
        <div className="mx-auto w-full max-w-[max(48rem,60vw)] flex-1 px-4 pb-10 pt-8 sm:px-6 sm:pt-10 lg:px-8">
            {isLoading && <LoadingOverlay />}
            <div className="flex items-center gap-3">
                <IoTrophyOutline className="size-8 shrink-0 text-rank-gold sm:size-9" />
                <div>
                    <h1 className="text-2xl font-bold text-ink sm:text-3xl">
                        {title} を編集
                    </h1>
                </div>
            </div>
            {(errMessage || violations.length > 0) && (
                <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-base text-red-600">
                    <HiOutlineExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
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
                </div>
            )}
            <div className="mt-10 flex flex-col gap-[1.8rem] md:gap-[2.8rem]">
                <div>
                    <label className="mb-3 block text-lg font-semibold text-ink">
                        タイトル
                    </label>
                    <Textbox
                        className="h-auto w-full rounded-none border-0 border-b-2 border-accent/50 bg-transparent px-1 py-2 text-xl font-bold text-ink focus:border-accent focus:ring-0 sm:text-2xl"
                        placeholder="例: 好きなラーメン屋ランキング"
                        registration={register('title')}
                    />
                    {errors.title?.message && (
                        <p className="mt-2 text-base text-red-500">{errors.title.message}</p>
                    )}
                </div>
                {/* 公開設定は現状UIから外している（ユーザーが自分専用で使う想定のため）
                <div>
                    <label className="mb-3 block text-lg font-semibold text-ink">
                        公開する
                    </label>
                    <div className="flex items-center justify-between rounded-xl border-2 border-accent/50 bg-surface px-4 py-4 shadow-sm">
                        <p className="text-base text-ink-sub">
                            他のユーザーの一覧に表示されます
                        </p>
                        <Controller
                            control={control}
                            name="isPublic"
                            render={({ field }) => (
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={field.value}
                                    aria-label="公開する"
                                    onClick={() => field.onChange(!field.value)}
                                    className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${field.value ? 'bg-accent' : 'bg-line'}`}
                                >
                                    <span
                                        className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${field.value ? 'translate-x-5' : 'translate-x-0'}`}
                                    />
                                </button>
                            )}
                        />
                    </div>
                </div>
                */}
                <div>
                    <label className="mb-3 block text-lg font-semibold text-ink">
                        メモ（任意）
                    </label>
                    <Textarea
                        className="w-full rounded-lg border-2 border-accent/50 bg-surface px-3 py-2 text-base text-ink shadow-sm focus:border-accent focus:ring-0"
                        placeholder="このランキングについてのメモ"
                        registration={register('memo')}
                    />
                    {errors.memo?.message && (
                        <p className="mt-2 text-base text-red-500">{errors.memo.message}</p>
                    )}
                </div>
                <div>
                    <label className="mb-3 block text-lg font-semibold text-ink">
                        ランキング項目
                    </label>
                    {(errors.items?.message ?? errors.items?.root?.message) && (
                        <p className="mb-2 text-base text-red-500">
                            {errors.items?.message ?? errors.items?.root?.message}
                        </p>
                    )}
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                            <div className="flex flex-col gap-4">
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
                        className="mt-4 w-full rounded-lg border-2 border-dashed border-accent/50 px-4 py-3 text-base font-semibold text-accent hover:bg-canvas"
                        onClick={addItem}
                    >
                        + 項目を追加
                    </button>
                </div>
                <div className="mt-2 flex flex-row gap-3 justify-end">
                    <button
                        type="button"
                        className="rounded-full border-2 border-accent/30 bg-surface px-8 py-3 text-base font-medium text-ink-sub transition-colors hover:bg-canvas"
                        onClick={onCancel}
                    >
                        キャンセル
                    </button>
                    <button
                        type="button"
                        className="rounded-full bg-accent-surface px-8 py-3 text-base font-medium text-white hover:bg-accent-surface-hover"
                        onClick={onSave}
                    >
                        保存する
                    </button>
                </div>
            </div>
            <ScrollToTopButton />
        </div>
    );
}
