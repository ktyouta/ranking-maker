import { Dialog } from '@/components';
import { HiArrowLeft } from 'react-icons/hi2';
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
                    className="shrink-0 rounded-full bg-accent px-5 py-2 text-base font-medium text-white hover:bg-accent-hover sm:px-8 sm:py-3"
                    onClick={onStartEdit}
                >
                    編集する
                </button>
            </div>
            <div className="mx-auto flex w-full max-w-[max(48rem,60vw)] flex-1 flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-8">
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
                <div className="mt-7 sm:mt-10 flex flex-1 flex-col gap-[1.8rem] md:gap-[2.8rem]">
                    <div>
                        <label className="mb-3 block text-lg font-semibold text-ink">
                            メモ
                        </label>
                        <p className="min-h-[7rem] whitespace-pre-wrap break-words rounded-xl border-2 border-accent/50 bg-surface px-4 py-4 text-base text-ink shadow-sm">
                            {memo || 'メモはありません'}
                        </p>
                    </div>
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
                                            : 'border-accent/20';

                                return (
                                    <div
                                        key={item.id}
                                        className={`flex items-start gap-3 rounded-2xl border bg-surface sm:gap-4 ${cardBorderClass} ${isTopRank ? 'p-4 shadow-lg sm:p-6' : 'p-3 shadow-sm'}`}
                                    >
                                        <span
                                            className={`flex shrink-0 items-center justify-center rounded-full font-bold shadow-sm ${rankBadgeClass} ${isTopRank ? 'mt-1 size-10 text-lg sm:size-12 sm:text-xl' : 'size-7 text-sm'}`}
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
                    <div className="mt-auto border-t border-line pt-16 sm:pt-6">
                        <div className="flex flex-col gap-4 rounded-xl border-2 border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-base font-semibold text-red-600">
                                    ランキングの削除
                                </p>
                                <p className="mt-1 text-base text-ink-sub">
                                    このランキングを削除します。ゴミ箱から元に戻せます。
                                </p>
                            </div>
                            <button
                                type="button"
                                className="shrink-0 rounded-full bg-red-500 px-8 py-3 text-base font-medium text-white hover:bg-red-600"
                                onClick={onClickDelete}
                            >
                                削除する
                            </button>
                        </div>
                    </div>
                </div>
            </div>
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
                            className="rounded-full bg-red-500 px-6 py-2 text-base font-medium text-white hover:bg-red-600"
                            onClick={onConfirmDelete}
                        >
                            削除する
                        </button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
