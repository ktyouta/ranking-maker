import { useIcons } from '@/app/api/get-icons';
import { myRankingKeys } from '@/app/api/query-key';
import { paths } from '@/config/paths';
import { useAppNavigation } from '@/hooks/use-app-navigation';
import { useSwitch } from '@/hooks/use-switch';
import { formatDate } from '@/utils/date-util';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePermanentDeleteTrashMutation } from '../api/permanent-delete-trash';
import { useTrashDetail } from '../api/get-trash-detail';
import { useRestoreTrashMutation } from '../api/restore-trash';
import { trashKeys } from '../api/query-key';

export function useTrashDetailScreen() {

    const { rankingId } = useParams();
    if (!rankingId) {
        throw new Error('rankingIdが指定されていません');
    }

    // ルーティング用（正常終了後の一覧遷移）
    const navigate = useNavigate();
    // ルーティング用（一覧に戻るボタン）
    const { appGoBack } = useAppNavigation();
    const queryClient = useQueryClient();
    // エラーメッセージ
    const [errMessage, setErrMessage] = useState(``);
    // 復元確認ダイアログの開閉
    const restoreDialog = useSwitch();
    // 完全削除確認ダイアログの開閉
    const permanentDeleteDialog = useSwitch();
    // メモダイアログの開閉
    const memoDialog = useSwitch();
    // 項目メモダイアログで表示中の項目（未選択時は null）
    const [selectedItemMemo, setSelectedItemMemo] = useState<{ itemName: string; itemMemo: string } | null>(null);

    // ゴミ箱のランキング取得（Suspense対応のため取得中は呼び出し元で中断される）
    const trashQuery = useTrashDetail(rankingId);
    const { ranking, rankingOrder } = trashQuery.data.data;
    // アイコン候補一覧（idからemojiを引くために使用）
    const iconsQuery = useIcons();
    const icons = iconsQuery.data.data;

    // 項目一覧を順位順に整形したもの
    const sortedItems = useMemo(() => {
        return [...rankingOrder].sort((a, b) => a.order - b.order);
    }, [rankingOrder]);

    /**
     * 一覧画面へ戻る
     */
    const goBack = useCallback(() => {
        appGoBack(paths.trash.path);
    }, [appGoBack]);

    // 復元リクエスト
    const restoreMutation = useRestoreTrashMutation({
        rankingId,
        // 正常終了後の処理
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trashKeys.lists() });
            queryClient.invalidateQueries({ queryKey: myRankingKeys.lists() });
            navigate(paths.trash.path);
        },
        // 失敗後の処理
        onError: (message) => {
            setErrMessage(message);
        },
    });

    // 完全削除リクエスト
    const permanentDeleteMutation = usePermanentDeleteTrashMutation({
        rankingId,
        // 正常終了後の処理
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trashKeys.lists() });
            navigate(paths.trash.path);
        },
        // 失敗後の処理
        onError: (message) => {
            setErrMessage(message);
        },
    });

    /**
     * 復元確認ダイアログを開く
     */
    const clickRestore = useCallback(() => {
        setErrMessage(``);
        restoreDialog.on();
    }, [restoreDialog]);

    /**
     * 復元確認ダイアログを閉じる
     */
    const cancelRestore = useCallback(() => {
        restoreDialog.off();
    }, [restoreDialog]);

    /**
     * ランキング復元実行
     */
    const confirmRestore = useCallback(() => {
        restoreDialog.off();
        restoreMutation.mutate();
    }, [restoreDialog, restoreMutation]);

    /**
     * 完全削除確認ダイアログを開く
     */
    const clickPermanentDelete = useCallback(() => {
        setErrMessage(``);
        permanentDeleteDialog.on();
    }, [permanentDeleteDialog]);

    /**
     * 完全削除確認ダイアログを閉じる
     */
    const cancelPermanentDelete = useCallback(() => {
        permanentDeleteDialog.off();
    }, [permanentDeleteDialog]);

    /**
     * 完全削除実行
     */
    const confirmPermanentDelete = useCallback(() => {
        permanentDeleteDialog.off();
        permanentDeleteMutation.mutate();
    }, [permanentDeleteDialog, permanentDeleteMutation]);

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
        memo: ranking.memo ?? ``,
        items: sortedItems.map((item) => ({
            id: item.id,
            order: item.order,
            itemName: item.itemName ?? ``,
            itemMemo: item.itemMemo ?? ``,
        })),
        updatedAt: formatDate(ranking.updatedAt),
        errMessage,
        onBack: goBack,
        isRestoreDialogOpen: restoreDialog.flag,
        onClickRestore: clickRestore,
        onCancelRestore: cancelRestore,
        onConfirmRestore: confirmRestore,
        isPermanentDeleteDialogOpen: permanentDeleteDialog.flag,
        onClickPermanentDelete: clickPermanentDelete,
        onCancelPermanentDelete: cancelPermanentDelete,
        onConfirmPermanentDelete: confirmPermanentDelete,
        isMemoDialogOpen: memoDialog.flag,
        onClickMemo: clickMemo,
        onCloseMemo: closeMemo,
        isItemMemoDialogOpen: selectedItemMemo !== null,
        selectedItemName: selectedItemMemo?.itemName ?? ``,
        selectedItemMemo: selectedItemMemo?.itemMemo ?? ``,
        onClickItemMemo: clickItemMemo,
        onCloseItemMemo: closeItemMemo,
        isLoading: restoreMutation.isPending || permanentDeleteMutation.isPending,
    };
}
