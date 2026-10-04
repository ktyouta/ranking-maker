import { Dialog, ErrorAlert, LoadingOverlay, ScrollToTopButton } from '@/components';
import { MemoViewDialog } from '@/components/layouts/memo-view-dialog/memo-view-dialog';
import { TagViewDialog } from '@/components/layouts/tag-view-dialog/tag-view-dialog';
import { HiArrowLeft, HiOutlineChevronLeft, HiOutlineDocumentText, HiOutlineTag } from 'react-icons/hi2';
import { IoCalendarOutline } from 'react-icons/io5';
import { type ItemType, TrashItemCard } from './trash-item-card';

type PropsType = {
    title: string;
    icon: string;
    memo: string;
    items: ItemType[];
    updatedAt: string;
    errMessage: string;
    onBack: () => void;
    isRestoreDialogOpen: boolean;
    onClickRestore: () => void;
    onCancelRestore: () => void;
    onConfirmRestore: () => void;
    isPermanentDeleteDialogOpen: boolean;
    onClickPermanentDelete: () => void;
    onCancelPermanentDelete: () => void;
    onConfirmPermanentDelete: () => void;
    isMemoDialogOpen: boolean;
    onClickMemo: () => void;
    onCloseMemo: () => void;
    tags: string[];
    isTagDialogOpen: boolean;
    onClickTag: () => void;
    onCloseTag: () => void;
    isItemMemoDialogOpen: boolean;
    selectedItemName: string;
    selectedItemMemo: string;
    onClickItemMemo: (item: ItemType) => void;
    onCloseItemMemo: () => void;
    isLoading: boolean;
};

/**
 * ゴミ箱のランキング詳細表示（閲覧専用）
 */
export function TrashDetail(props: PropsType) {

    const {
        title,
        icon,
        memo,
        items,
        updatedAt,
        errMessage,
        onBack,
        isRestoreDialogOpen,
        onClickRestore,
        onCancelRestore,
        onConfirmRestore,
        isPermanentDeleteDialogOpen,
        onClickPermanentDelete,
        onCancelPermanentDelete,
        onConfirmPermanentDelete,
        isMemoDialogOpen,
        onClickMemo,
        onCloseMemo,
        tags,
        isTagDialogOpen,
        onClickTag,
        onCloseTag,
        isItemMemoDialogOpen,
        selectedItemName,
        selectedItemMemo,
        onClickItemMemo,
        onCloseItemMemo,
        isLoading,
    } = props;

    return (
        <div className="flex flex-1 flex-col">
            {isLoading && <LoadingOverlay />}
            {/* 一覧に戻る（ヘッダーのアプリタイトルと同じ左位置に揃え、常に画面上部の左に固定する） */}
            <div className="flex w-full items-center px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-accent hover:text-accent-hover sm:text-ink-sub sm:hover:text-ink"
                >
                    <span className="flex size-9 items-center justify-center rounded-full bg-accent/15 sm:hidden">
                        <HiOutlineChevronLeft strokeWidth={2.5} className="size-5" />
                    </span>
                    <HiArrowLeft className="hidden size-4 sm:block" />
                    <span className="hidden text-[13px] sm:inline sm:text-base">
                        一覧に戻る
                    </span>
                </button>
            </div>
            <div className="mx-auto flex w-full max-w-[max(48rem,60vw)] flex-1 flex-col px-4 pb-8 pt-3 sm:pt-4 sm:px-6 lg:px-8">
                {errMessage && (
                    <ErrorAlert className="mb-4">
                        <p>{errMessage}</p>
                    </ErrorAlert>
                )}
                {/* sm未満/sm以上でDOM構造が異なる二重定義。片方を直す際はもう片方も直すこと */}
                <div className="flex flex-col gap-3 sm:hidden">
                    <div className="flex items-center gap-3">
                        <span className="flex shrink-0 items-center justify-center text-3xl">
                            {icon}
                        </span>
                        <h1 className="text-xl font-bold text-ink">
                            {title}
                        </h1>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full bg-line px-3 py-1.5 text-xs text-ink-sub">
                            <IoCalendarOutline className="size-4" />
                            更新日 {updatedAt}
                        </span>
                        <div className="flex shrink-0 items-center gap-1.5">
                            <button
                                type="button"
                                onClick={onClickMemo}
                                className="shrink-0 rounded-full bg-accent/15 p-[9px] text-accent hover:bg-accent/25"
                                aria-label="メモを見る"
                            >
                                <HiOutlineDocumentText className="size-[22px]" />
                            </button>
                            <button
                                type="button"
                                onClick={onClickTag}
                                className="shrink-0 rounded-full bg-accent/15 p-[9px] text-accent hover:bg-accent/25"
                                aria-label="タグを見る"
                            >
                                <HiOutlineTag className="size-[22px]" />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="hidden items-center justify-between gap-3 sm:flex">
                    <div className="flex min-w-0 items-center gap-5">
                        <span className="flex shrink-0 items-center justify-center text-5xl">
                            {icon}
                        </span>
                        <div className="min-w-0">
                            <h1 className="text-3xl font-bold text-ink">
                                {title}
                            </h1>
                            <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-line px-3 py-1.5 text-base text-ink-sub">
                                <IoCalendarOutline className="size-4" />
                                更新日 {updatedAt}
                            </span>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <button
                            type="button"
                            onClick={onClickMemo}
                            className="shrink-0 rounded-full bg-accent/15 p-[11px] text-accent hover:bg-accent/25"
                            aria-label="メモを見る"
                        >
                            <HiOutlineDocumentText className="size-[26px]" />
                        </button>
                        <button
                            type="button"
                            onClick={onClickTag}
                            className="shrink-0 rounded-full bg-accent/15 p-[11px] text-accent hover:bg-accent/25"
                            aria-label="タグを見る"
                        >
                            <HiOutlineTag className="size-[26px]" />
                        </button>
                    </div>
                </div>
                <div className="mt-12 sm:mt-16 flex flex-1 flex-col gap-[1.8rem] md:gap-[2.8rem]">
                    <div className="flex flex-col gap-6">
                        {items.map((item, index) => (
                            <TrashItemCard
                                key={item.id}
                                item={item}
                                index={index}
                                onClickMemo={onClickItemMemo}
                            />
                        ))}
                    </div>
                    <div className="mt-auto flex flex-col gap-4 border-t border-line pt-16 sm:pt-6">
                        <div className="flex flex-col gap-4 rounded-xl border-2 border-accent/30 bg-accent/5 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-base font-semibold text-accent">
                                    ランキングの復元
                                </p>
                                <p className="mt-1 text-base text-ink-sub">
                                    このランキングを復元します。復元後はランキング一覧から参照できます。
                                </p>
                            </div>
                            <button
                                type="button"
                                className="shrink-0 rounded-full bg-accent-surface px-8 py-3 text-base font-medium text-white hover:bg-accent-surface-hover"
                                onClick={onClickRestore}
                            >
                                復元
                            </button>
                        </div>
                        <div className="flex flex-col gap-4 rounded-xl border-2 border-danger-border bg-danger-bg p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-base font-semibold text-danger">
                                    ランキングの完全削除
                                </p>
                                <p className="mt-1 text-base text-ink-sub">
                                    このランキングを完全に削除します。削除後は元に戻せません。
                                </p>
                            </div>
                            <button
                                type="button"
                                className="shrink-0 rounded-full bg-danger-fill px-8 py-3 text-base font-medium text-white hover:bg-danger-fill-hover"
                                onClick={onClickPermanentDelete}
                            >
                                完全削除
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <MemoViewDialog
                isOpen={isMemoDialogOpen}
                onClose={onCloseMemo}
                title="メモ"
                memo={memo}
            />
            <TagViewDialog
                isOpen={isTagDialogOpen}
                onClose={onCloseTag}
                tags={tags}
            />
            <MemoViewDialog
                isOpen={isItemMemoDialogOpen}
                onClose={onCloseItemMemo}
                title={selectedItemName || 'メモ'}
                memo={selectedItemMemo}
            />
            <Dialog
                isOpen={isRestoreDialogOpen}
                onClose={onCancelRestore}
                title="ランキングの復元"
                size="small"
            >
                <div className="space-y-4">
                    <p className="text-base text-ink">
                        このランキングを復元しますか？<br />
                        復元後はランキング一覧から参照できます。
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            className="rounded-full border-2 border-accent/30 bg-surface px-5 py-2 text-sm sm:px-6 sm:text-base font-medium text-ink-sub hover:bg-canvas"
                            onClick={onCancelRestore}
                        >
                            キャンセル
                        </button>
                        <button
                            type="button"
                            className="rounded-full bg-accent-surface px-5 py-2 text-sm sm:px-6 sm:text-base font-medium text-white hover:bg-accent-surface-hover"
                            onClick={onConfirmRestore}
                        >
                            復元
                        </button>
                    </div>
                </div>
            </Dialog>
            <Dialog
                isOpen={isPermanentDeleteDialogOpen}
                onClose={onCancelPermanentDelete}
                title="ランキングの完全削除"
                size="small"
            >
                <div className="space-y-4">
                    <p className="text-base text-ink">
                        このランキングを完全に削除しますか？<br />
                        削除後は元に戻せません。
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            className="rounded-full border-2 border-accent/30 bg-surface px-5 py-2 text-sm sm:px-6 sm:text-base font-medium text-ink-sub hover:bg-canvas"
                            onClick={onCancelPermanentDelete}
                        >
                            キャンセル
                        </button>
                        <button
                            type="button"
                            className="rounded-full bg-danger-fill px-5 py-2 text-sm sm:px-6 sm:text-base font-medium text-white hover:bg-danger-fill-hover"
                            onClick={onConfirmPermanentDelete}
                        >
                            完全削除
                        </button>
                    </div>
                </div>
            </Dialog>
            <ScrollToTopButton />
        </div>
    );
}
