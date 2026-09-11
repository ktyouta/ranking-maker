import { useIcons } from '@/app/api/get-icons';
import { paths } from '@/config/paths';
import { PUBLIC_STATUS } from '@/constants/public-status';
import { myRankingKeys } from '@/features/my-ranking/api/query-key';
import { useSwitch } from '@/hooks/use-switch';
import { formatDate } from '@/utils/date-util';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDeleteMyRankingMutation } from '../api/delete-my-ranking';
import { useMyRanking } from '../api/get-my-ranking';

type PropsType = {
    onStartEdit: () => void;
};

export function useMyRankingDetailView({ onStartEdit }: PropsType) {

    const { rankingId } = useParams();
    if (!rankingId) {
        throw new Error('rankingIdが指定されていません');
    }

    // ルーティング用
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    // 削除確認ダイアログの開閉
    const deleteDialog = useSwitch();
    // メモダイアログの開閉
    const memoDialog = useSwitch();
    // 項目メモダイアログで表示中の項目（未選択時は null）
    const [selectedItemMemo, setSelectedItemMemo] = useState<{ itemName: string; itemMemo: string } | null>(null);

    // ランキング取得（Suspense対応のため取得中は呼び出し元で中断される）
    const rankingQuery = useMyRanking(rankingId);
    // ランキング本体と項目一覧
    const { ranking, rankingOrder } = rankingQuery.data.data;
    // アイコン候補一覧（idからemojiを引くために使用）
    const iconsQuery = useIcons();
    const icons = iconsQuery.data.data;

    // 項目一覧を順位順に整形したもの
    const sortedItems = useMemo(() => {
        return [...rankingOrder].sort((a, b) => a.order - b.order);
    }, [rankingOrder]);

    // 削除リクエスト
    const deleteMutation = useDeleteMyRankingMutation({
        rankingId,
        // 正常終了後の処理
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: myRankingKeys.lists() });
            toast.success(data.message);
            navigate(paths.myRanking.path);
        },
        onError: () => { },
    });

    /**
     * 一覧画面へ戻る
     */
    const goBack = useCallback(() => {
        navigate(paths.myRanking.path);
    }, [navigate]);

    /**
     * 削除確認ダイアログを開く
     */
    const clickDelete = useCallback(() => {
        deleteDialog.on();
    }, [deleteDialog]);

    /**
     * 削除確認ダイアログを閉じる
     */
    const cancelDelete = useCallback(() => {
        deleteDialog.off();
    }, [deleteDialog]);

    /**
     * 削除実行
     */
    const confirmDelete = useCallback(() => {
        deleteDialog.off();
        deleteMutation.mutate();
    }, [deleteDialog, deleteMutation]);

    /**
     * メモダイアログを開く
     */
    const clickMemo = useCallback(() => {
        memoDialog.on();
    }, [memoDialog]);

    /**
     * メモダイアログを閉じる
     */
    const closeMemo = useCallback(() => {
        memoDialog.off();
    }, [memoDialog]);

    /**
     * 項目メモダイアログを開く
     */
    const clickItemMemo = useCallback((item: { itemName: string; itemMemo: string }) => {
        setSelectedItemMemo(item);
    }, []);

    /**
     * 項目メモダイアログを閉じる
     */
    const closeItemMemo = useCallback(() => {
        setSelectedItemMemo(null);
    }, []);

    return {
        title: ranking.title,
        icon: icons.find((icon) => icon.id === ranking.icon)?.emoji ?? '',
        publicStatusLabel: ranking.publicStatusName,
        isPublic: ranking.publicStatus === PUBLIC_STATUS.PUBLIC,
        memo: ranking.memo ?? ``,
        items: sortedItems.map((item) => ({
            id: item.id,
            order: item.order,
            itemName: item.itemName ?? ``,
            itemMemo: item.itemMemo ?? ``,
        })),
        updatedAt: formatDate(ranking.updatedAt),
        onStartEdit,
        onBack: goBack,
        isDeleteDialogOpen: deleteDialog.flag,
        onClickDelete: clickDelete,
        onCancelDelete: cancelDelete,
        onConfirmDelete: confirmDelete,
        isMemoDialogOpen: memoDialog.flag,
        onClickMemo: clickMemo,
        onCloseMemo: closeMemo,
        isItemMemoDialogOpen: selectedItemMemo !== null,
        selectedItemName: selectedItemMemo?.itemName ?? ``,
        selectedItemMemo: selectedItemMemo?.itemMemo ?? ``,
        onClickItemMemo: clickItemMemo,
        onCloseItemMemo: closeItemMemo,
    };
}
