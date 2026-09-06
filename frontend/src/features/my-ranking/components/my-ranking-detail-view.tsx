import { Dialog, ScrollToTopButton } from '@/components';
import { HiArrowLeft, HiOutlineDocumentText, HiOutlineTrash } from 'react-icons/hi2';
import { IoCalendarOutline, IoTrophyOutline } from 'react-icons/io5';
import { ItemType, RankingItemCard } from './ranking-item-card';

type PropsType = {
    title: string;
    // 現状は非表示だが、他ユーザーとの共有機能を見据えてデータは引き続き渡す
    publicStatusLabel: string;
    isPublic: boolean;
    memo: string;
    items: ItemType[];
    createdAt: string;
    onStartEdit: () => void;
    onBack: () => void;
    isDeleteDialogOpen: boolean;
    onClickDelete: () => void;
    onCancelDelete: () => void;
    onConfirmDelete: () => void;
    isMemoDialogOpen: boolean;
    onClickMemo: () => void;
    onCloseMemo: () => void;
    isItemMemoDialogOpen: boolean;
    selectedItemName: string;
    selectedItemMemo: string;
    onClickItemMemo: (item: ItemType) => void;
    onCloseItemMemo: () => void;
};

/**
 * ランキング詳細の閲覧モード表示
 */
export function MyRankingDetailView(props: PropsType) {

    const {
        title,
        memo,
        items,
        createdAt,
        onStartEdit,
        onBack,
        isDeleteDialogOpen,
        onClickDelete,
        onCancelDelete,
        onConfirmDelete,
        isMemoDialogOpen,
        onClickMemo,
        onCloseMemo,
        isItemMemoDialogOpen,
        selectedItemName,
        selectedItemMemo,
        onClickItemMemo,
        onCloseItemMemo,
    } = props;

    return (
        <div className="flex flex-1 flex-col">
            {/* 一覧に戻る・編集する（ヘッダーのアプリタイトルと同じ左位置に揃え、常に画面上部の左右に固定する） */}
            <div className="flex w-full items-center justify-between px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-base text-ink-sub hover:text-ink"
                >
                    <HiArrowLeft className="size-4" />
                    一覧に戻る
                </button>
                <button
                    type="button"
                    className="shrink-0 rounded-full bg-accent-surface px-5 py-2 text-base font-medium text-white hover:bg-accent-surface-hover sm:px-8 sm:py-3"
                    onClick={onStartEdit}
                >
                    編集する
                </button>
            </div>
            <div className="mx-auto flex w-full max-w-[max(48rem,60vw)] flex-1 flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <IoTrophyOutline className="size-8 shrink-0 text-rank-gold sm:size-9" />
                        <div>
                            <h1 className="text-2xl font-bold text-ink sm:text-3xl">
                                {title}
                            </h1>
                            <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-line px-3 py-1 text-base text-ink-sub">
                                <IoCalendarOutline className="size-4" />
                                作成日 {createdAt}
                            </span>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <button
                            type="button"
                            onClick={onClickMemo}
                            className="shrink-0 rounded-full bg-accent/15 p-2.5 text-accent hover:bg-accent/25"
                            aria-label="メモを見る"
                        >
                            <HiOutlineDocumentText className="size-6 sm:size-7" />
                        </button>
                        <button
                            type="button"
                            onClick={onClickDelete}
                            className="shrink-0 rounded-full bg-danger/15 p-2.5 text-danger hover:bg-danger/25"
                            aria-label="ランキングを削除"
                        >
                            <HiOutlineTrash className="size-6 sm:size-7" />
                        </button>
                    </div>
                </div>
                <div className="mt-12 sm:mt-16 flex flex-1 flex-col gap-[1.8rem] md:gap-[2.8rem]">
                    <div className="flex flex-col gap-6">
                        {items.map((item, index) => (
                            <RankingItemCard
                                key={item.id}
                                item={item}
                                index={index}
                                onClickMemo={onClickItemMemo}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <Dialog
                isOpen={isMemoDialogOpen}
                onClose={onCloseMemo}
                title="メモ"
                size="large"
            >
                <p className="min-h-[14rem] whitespace-pre-wrap break-words text-base text-ink">
                    {memo || 'メモはありません'}
                </p>
            </Dialog>
            <Dialog
                isOpen={isItemMemoDialogOpen}
                onClose={onCloseItemMemo}
                title={selectedItemName || 'メモ'}
                size="large"
            >
                <p className="min-h-[14rem] whitespace-pre-wrap break-words text-base text-ink">
                    {selectedItemMemo || 'メモはありません'}
                </p>
            </Dialog>
            <Dialog
                isOpen={isDeleteDialogOpen}
                onClose={onCancelDelete}
                title="ランキングの削除"
                size="small"
            >
                <div className="space-y-4">
                    <p className="text-base text-ink">
                        このランキングを削除しますか？<br />
                        削除後もゴミ箱からいつでも復元できます。
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            className="rounded-full border-2 border-accent/30 bg-surface px-6 py-2 text-base font-medium text-ink-sub hover:bg-canvas"
                            onClick={onCancelDelete}
                        >
                            キャンセル
                        </button>
                        <button
                            type="button"
                            className="rounded-full bg-danger-fill px-6 py-2 text-base font-medium text-white hover:bg-danger-fill-hover"
                            onClick={onConfirmDelete}
                        >
                            削除する
                        </button>
                    </div>
                </div>
            </Dialog>
            <ScrollToTopButton />
        </div>
    );
}
