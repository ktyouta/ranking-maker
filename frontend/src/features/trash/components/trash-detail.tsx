import { Dialog, LoadingOverlay } from '@/components';
import { HiArrowLeft, HiOutlineDocumentText, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import { IoCalendarOutline, IoTrophyOutline } from 'react-icons/io5';

const TOP_RANK_COUNT = 3;

type ItemType = {
    id: string;
    order: number;
    itemName: string;
    itemMemo: string;
};

type PropsType = {
    title: string;
    memo: string;
    items: ItemType[];
    createdAt: string;
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
    isLoading: boolean;
};

/**
 * ゴミ箱のランキング詳細表示（閲覧専用）
 */
export function TrashDetail(props: PropsType) {

    const {
        title,
        memo,
        items,
        createdAt,
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
                    className="flex items-center gap-1.5 text-base text-ink-sub hover:text-ink"
                >
                    <HiArrowLeft className="size-4" />
                    一覧に戻る
                </button>
            </div>
            <div className="mx-auto flex w-full max-w-[max(48rem,60vw)] flex-1 flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-8">
                {errMessage && (
                    <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-base text-red-600">
                        <HiOutlineExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                        <p>{errMessage}</p>
                    </div>
                )}
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
                    {memo && (
                        <button
                            type="button"
                            onClick={onClickMemo}
                            className="shrink-0 rounded-full bg-accent/15 p-2.5 text-accent hover:bg-accent/25"
                            aria-label="メモを見る"
                        >
                            <HiOutlineDocumentText className="size-6 sm:size-7" />
                        </button>
                    )}
                </div>
                <div className="mt-9 sm:mt-12 flex flex-1 flex-col gap-[1.8rem] md:gap-[2.8rem]">
                    <div>
                        <label className="mb-3 block text-lg font-semibold text-ink">
                            ランキング項目
                        </label>
                        <div className="flex flex-col gap-6">
                            {items.map((item, index) => {
                                const isTopRank = index < TOP_RANK_COUNT;
                                const rankBadgeClass = index === 0
                                    ? 'bg-rank-gold text-white'
                                    : index === 1
                                        ? 'bg-rank-silver text-white'
                                        : index === 2
                                            ? 'bg-rank-bronze text-white'
                                            : 'bg-accent/15 text-accent';
                                const cardBorderClass = index === 0
                                    ? 'border-rank-gold/60'
                                    : index === 1
                                        ? 'border-rank-silver/60'
                                        : index === 2
                                            ? 'border-rank-bronze/60'
                                            : 'border-accent/60';

                                return (
                                    <div
                                        key={item.id}
                                        className={`flex items-start gap-3 rounded-2xl border bg-surface sm:gap-4 ${cardBorderClass} p-4 sm:p-6 shadow-sm`}
                                    >
                                        <span
                                            className={`flex shrink-0 items-center justify-center rounded-full font-bold shadow-sm ${rankBadgeClass} ${isTopRank ? 'mt-1 size-10 text-lg sm:size-12 sm:text-xl' : 'size-8 text-sm'}`}
                                        >
                                            {item.order}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className={`break-words font-semibold text-ink ${isTopRank ? 'text-lg sm:text-xl' : 'text-base'}`}>
                                                {item.itemName || <span className="text-ink-sub">項目未設定</span>}
                                            </p>
                                            <p className="mt-3 whitespace-pre-wrap break-words border-t border-line pt-3 text-base text-ink-sub">
                                                {item.itemMemo || 'メモはありません'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
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
                                復元する
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
                                完全削除する
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Dialog
                isOpen={isMemoDialogOpen}
                onClose={onCloseMemo}
                title="メモ"
                size="large"
                headerVariant="accent"
            >
                <p className="min-h-[14rem] whitespace-pre-wrap break-words text-base text-ink">
                    {memo}
                </p>
            </Dialog>
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
                            className="rounded-full border-2 border-accent/30 bg-surface px-6 py-2 text-base font-medium text-ink-sub hover:bg-canvas"
                            onClick={onCancelRestore}
                        >
                            キャンセル
                        </button>
                        <button
                            type="button"
                            className="rounded-full bg-accent-surface px-6 py-2 text-base font-medium text-white hover:bg-accent-surface-hover"
                            onClick={onConfirmRestore}
                        >
                            復元する
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
                            className="rounded-full border-2 border-accent/30 bg-surface px-6 py-2 text-base font-medium text-ink-sub hover:bg-canvas"
                            onClick={onCancelPermanentDelete}
                        >
                            キャンセル
                        </button>
                        <button
                            type="button"
                            className="rounded-full bg-danger-fill px-6 py-2 text-base font-medium text-white hover:bg-danger-fill-hover"
                            onClick={onConfirmPermanentDelete}
                        >
                            完全削除する
                        </button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
