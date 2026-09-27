import { IconType } from '@/app/api/get-icons';
import { Dialog, LoadingOverlay, ScrollToTopButton, Textarea, Textbox } from '@/components';
import { IconSelectDialog } from '@/components/layouts/icon-select-dialog/icon-select-dialog';
import { TagSelectDialog } from '@/components/layouts/tag-select-dialog/tag-select-dialog';
import { closestCenter, DndContext, DragEndEvent, SensorDescriptor, SensorOptions } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { BaseSyntheticEvent, type KeyboardEvent } from 'react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { HiOutlineExclamationTriangle, HiOutlineTag } from 'react-icons/hi2';
import { CreateRankingRequestType, MAX_TAG_COUNT } from '../types/create-ranking-request-type';
import { ItemFieldType, ItemRow } from './item-row';
import { TemplateSelectDialog } from './template-select-dialog';

type PropsType = {
    errMessage: string;
    violations: { field: string; message: string }[];
    register: UseFormRegister<CreateRankingRequestType>;
    errors: FieldErrors<CreateRankingRequestType>;
    items: ItemFieldType[];
    sensors: SensorDescriptor<SensorOptions>[];
    addItem: () => void;
    removeItem: (index: number) => void;
    moveItemUp: (index: number) => void;
    moveItemDown: (index: number) => void;
    handleDragEnd: (event: DragEndEvent) => void;
    isLoading: boolean;
    handleConfirm: (e?: BaseSyntheticEvent) => Promise<void>;
    icons: IconType[];
    selectedIconId: number;
    isIconDialogOpen: boolean;
    openIconDialog: () => void;
    closeIconDialog: () => void;
    selectIcon: (iconId: number) => void;
    selectedTags: string[];
    candidateTags: string[];
    isTagDialogOpen: boolean;
    openTagDialog: () => void;
    closeTagDialog: () => void;
    tagInput: string;
    changeTagInput: (value: string) => void;
    keyDownTagInput: (event: KeyboardEvent<HTMLInputElement>) => void;
    addTag: () => void;
    toggleTag: (tagName: string) => void;
    removeTag: (tagName: string) => void;
    tagErrMessage: string;
    isTemplateDialogOpen: boolean;
    openTemplateDialog: () => void;
    closeTemplateDialog: () => void;
    selectTemplate: (rankingId: string) => void;
    isClearDialogOpen: boolean;
    clickClear: () => void;
    cancelClear: () => void;
    confirmClear: () => void;
};

export function CreateRanking(props: PropsType) {

    const {
        errMessage,
        violations,
        register,
        errors,
        items,
        sensors,
        addItem,
        removeItem,
        moveItemUp,
        moveItemDown,
        handleDragEnd,
        isLoading,
        handleConfirm,
        icons,
        selectedIconId,
        isIconDialogOpen,
        openIconDialog,
        closeIconDialog,
        selectIcon,
        selectedTags,
        candidateTags,
        isTagDialogOpen,
        openTagDialog,
        closeTagDialog,
        tagInput,
        changeTagInput,
        keyDownTagInput,
        addTag,
        toggleTag,
        removeTag,
        tagErrMessage,
        isTemplateDialogOpen,
        openTemplateDialog,
        closeTemplateDialog,
        selectTemplate,
        isClearDialogOpen,
        clickClear,
        cancelClear,
        confirmClear,
    } = props;

    // 選択中のアイコンの絵文字
    const selectedIconEmoji = icons.find((icon) => icon.id === selectedIconId)?.emoji;

    return (
        <div className="mx-auto w-full max-w-[max(48rem,60vw)] flex flex-col flex-1 px-4 pb-10 pt-8 sm:px-6 sm:pt-16 lg:px-8">
            {isLoading && <LoadingOverlay />}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={openIconDialog}
                        className="flex size-14 shrink-0 items-center justify-center rounded-lg border-2 border-accent/50 bg-surface text-3xl shadow-sm hover:bg-canvas sm:size-16 sm:text-4xl"
                        aria-label="アイコンを選択"
                    >
                        {selectedIconEmoji}
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-ink sm:text-3xl">
                            ランキングを作成
                        </h1>
                        <p className="mt-1 text-sm text-ink-sub sm:text-lg">
                            あなたの「好き」を並べて、ランキングを作ろう
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={openTemplateDialog}
                    className="ml-auto shrink-0 rounded-full border border-accent/70 bg-surface px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/10 sm:px-6 sm:py-2.5 sm:text-base"
                >
                    テンプレートから作成
                </button>
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
            <div className="mt-1 md:mt-9 flex flex-col flex-1 gap-[1.8rem] md:gap-[2.8rem]">
                <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <label className="block text-lg font-semibold text-ink">
                            タイトル
                        </label>
                        <button
                            type="button"
                            onClick={openTagDialog}
                            className="relative shrink-0 rounded-full bg-accent/15 p-2 text-accent hover:bg-accent/25"
                            aria-label="タグを設定"
                        >
                            <HiOutlineTag className="size-6" />
                            {selectedTags.length > 0 && (
                                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-surface px-1 text-xs font-bold text-white">
                                    {selectedTags.length}
                                </span>
                            )}
                        </button>
                    </div>
                    <Textbox
                        className="h-auto w-full rounded-none border-0 border-b-2 border-accent/50 bg-transparent px-1 py-2 text-xl font-bold text-ink focus:border-accent focus:ring-0 sm:text-2xl"
                        placeholder="例: 好きなラーメン屋ランキング"
                        registration={register('title')}
                    />
                    {errors.title?.message && (
                        <p className="mt-2 text-base text-red-500">{errors.title.message}</p>
                    )}
                    {errors.tags?.message && (
                        <p className="mt-2 text-base text-red-500">{errors.tags.message}</p>
                    )}
                </div>
                {/* 公開設定は現状UIから外している（ユーザーが自分専用で使う想定のため）
                <div>
                    <label className="mb-3 block text-lg font-semibold text-ink">
                        公開
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
                                    aria-label="公開"
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
                <div className='flex flex-col flex-1'>
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
                        onClick={clickClear}
                    >
                        クリア
                    </button>
                    <button
                        type="button"
                        className="rounded-full bg-accent-surface px-8 py-3 text-base font-medium text-white hover:bg-accent-surface-hover"
                        onClick={handleConfirm}
                    >
                        作成
                    </button>
                </div>
            </div>
            <ScrollToTopButton />
            <IconSelectDialog
                isOpen={isIconDialogOpen}
                onClose={closeIconDialog}
                icons={icons}
                selectedIconId={selectedIconId}
                onSelect={selectIcon}
            />
            <TagSelectDialog
                isOpen={isTagDialogOpen}
                onClose={closeTagDialog}
                selectedTags={selectedTags}
                maxTagCount={MAX_TAG_COUNT}
                candidateTags={candidateTags}
                tagInput={tagInput}
                onChangeTagInput={changeTagInput}
                onKeyDownTagInput={keyDownTagInput}
                onAddTag={addTag}
                onToggleTag={toggleTag}
                onRemoveTag={removeTag}
                errMessage={tagErrMessage}
            />
            <TemplateSelectDialog
                isOpen={isTemplateDialogOpen}
                onClose={closeTemplateDialog}
                onSelectRanking={selectTemplate}
            />
            <Dialog
                isOpen={isClearDialogOpen}
                onClose={cancelClear}
                title="入力内容のクリア"
                size="small"
            >
                <div className="space-y-4">
                    <p className="text-base text-ink">
                        現在の入力をクリアしますか？
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            className="rounded-full border-2 border-accent/30 bg-surface px-6 py-2 text-base font-medium text-ink-sub hover:bg-canvas"
                            onClick={cancelClear}
                        >
                            キャンセル
                        </button>
                        <button
                            type="button"
                            className="rounded-full bg-accent-surface px-6 py-2 text-base font-medium text-white hover:bg-accent-surface-hover"
                            onClick={confirmClear}
                        >
                            クリア
                        </button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
