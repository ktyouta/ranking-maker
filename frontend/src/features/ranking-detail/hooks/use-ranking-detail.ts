import { paths } from '@/config/paths';
import { PUBLIC_STATUS } from '@/constants/public-status';
import { myRankingKeys } from '@/features/my-ranking/api/query-key';
import { useSwitch } from '@/hooks/use-switch';
import { formatDate } from '@/utils/date-util';
import { KeyboardSensor, PointerSensor, type DragEndEvent, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDeleteRankingMutation } from '../api/delete-ranking';
import { useRanking } from '../api/get-ranking';
import { useUpdateRankingMutation, ViolationType } from '../api/update-ranking';
import { useUpdateRankingForm } from './use-update-ranking.form';

const MIN_ITEM_COUNT = 1;

type Mode = 'view' | 'edit';

export function useRankingDetail() {

    const { rankingId } = useParams();
    if (!rankingId) {
        throw new Error('rankingIdが指定されていません');
    }

    // ルーティング用
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    // 閲覧・編集モード
    const [mode, setMode] = useState<Mode>('view');
    // エラーメッセージ
    const [errMessage, setErrMessage] = useState(``);
    // フィールド単位に紐付かないエラー一覧（バリデーション・不適切内容検出）
    const [violations, setViolations] = useState<ViolationType[]>([]);
    // 削除確認ダイアログの開閉
    const deleteDialog = useSwitch();

    // ランキング取得（Suspense対応のため取得中は呼び出し元で中断される）
    const rankingQuery = useRanking(rankingId);
    // ランキング本体と項目一覧
    const { ranking, rankingOrder } = rankingQuery.data.data;

    // 項目一覧を順位順に整形したもの
    const sortedItems = useMemo(() => {
        return [...rankingOrder].sort((a, b) => a.order - b.order);
    }, [rankingOrder]);

    // 編集フォームの初期値
    const defaultValues = useMemo(() => ({
        title: ranking.title,
        isPublic: ranking.publicStatus === PUBLIC_STATUS.PUBLIC,
        memo: ranking.memo ?? ``,
        items: sortedItems.map((item) => ({
            itemName: item.itemName ?? ``,
            memo: item.itemMemo ?? ``,
        })),
    }), [ranking, sortedItems]);

    // フォーム
    const { register, handleSubmit, control, reset, formState: { errors }, itemFieldArray } = useUpdateRankingForm(defaultValues);
    // ポインター操作とキーボード操作の両方でドラッグ&ドロップを可能にする
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    // 更新リクエスト
    const updateMutation = useUpdateRankingMutation({
        rankingId,
        // 正常終了後の処理
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: myRankingKeys.detail(rankingId) });
            queryClient.invalidateQueries({ queryKey: myRankingKeys.lists() });
            setMode('view');
        },
        // 失敗後の処理
        onError: (message, errViolations) => {
            setErrMessage(message);
            setViolations(errViolations ?? []);
        },
    });

    // 削除リクエスト
    const deleteMutation = useDeleteRankingMutation({
        rankingId,
        // 正常終了後の処理
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: myRankingKeys.lists() });
            navigate(paths.myRanking.path);
        },
        // 失敗後の処理
        onError: (message) => {
            setErrMessage(message);
        },
    });

    /**
     * 編集モードへ切り替え
     */
    const startEdit = useCallback(() => {
        setErrMessage(``);
        setViolations([]);
        setMode('edit');
    }, []);

    /**
     * 編集キャンセル（閲覧モードへ戻す）
     */
    const cancelEdit = useCallback(() => {
        reset(defaultValues);
        setErrMessage(``);
        setViolations([]);
        setMode('view');
    }, [reset, defaultValues]);

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
     * ランキング更新実行
     */
    const handleSave = handleSubmit((data) => {
        updateMutation.mutate({
            title: data.title,
            publicStatus: data.isPublic ? PUBLIC_STATUS.PUBLIC : PUBLIC_STATUS.PRIVATE,
            memo: data.memo,
            items: data.items.map((item, index) => ({
                itemName: item.itemName,
                memo: item.memo,
                order: index + 1,
            })),
        });
    });

    /**
     * ランキング項目を末尾に追加
     */
    const addItem = useCallback(() => {
        itemFieldArray.append({ itemName: ``, memo: `` });
    }, [itemFieldArray]);

    /**
     * ランキング項目を削除（最後の1件は削除不可）
     */
    const removeItem = useCallback((index: number) => {
        if (itemFieldArray.fields.length <= MIN_ITEM_COUNT) {
            return;
        }
        itemFieldArray.remove(index);
    }, [itemFieldArray]);

    /**
     * ランキング項目を1つ上に移動
     */
    const moveItemUp = useCallback((index: number) => {
        if (index <= 0) {
            return;
        }
        itemFieldArray.move(index, index - 1);
    }, [itemFieldArray]);

    /**
     * ランキング項目を1つ下に移動
     */
    const moveItemDown = useCallback((index: number) => {
        if (index >= itemFieldArray.fields.length - 1) {
            return;
        }
        itemFieldArray.move(index, index + 1);
    }, [itemFieldArray]);

    /**
     * ドラッグ&ドロップによる並び替え
     */
    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) {
            return;
        }
        const oldIndex = itemFieldArray.fields.findIndex((field) => field.id === active.id);
        const newIndex = itemFieldArray.fields.findIndex((field) => field.id === over.id);
        if (oldIndex === -1 || newIndex === -1) {
            return;
        }
        itemFieldArray.move(oldIndex, newIndex);
    }, [itemFieldArray]);

    return {
        mode,
        view: {
            title: ranking.title,
            publicStatusLabel: ranking.publicStatusName,
            isPublic: ranking.publicStatus === PUBLIC_STATUS.PUBLIC,
            memo: ranking.memo ?? ``,
            items: sortedItems.map((item) => ({
                id: item.id,
                order: item.order,
                itemName: item.itemName ?? ``,
                itemMemo: item.itemMemo ?? ``,
            })),
            createdAt: formatDate(ranking.createdAt),
            onStartEdit: startEdit,
            onBack: goBack,
            isDeleteDialogOpen: deleteDialog.flag,
            onClickDelete: clickDelete,
            onCancelDelete: cancelDelete,
            onConfirmDelete: confirmDelete,
        },
        edit: {
            title: ranking.title,
            errMessage,
            violations,
            register,
            control,
            errors,
            items: itemFieldArray.fields,
            sensors,
            addItem,
            removeItem,
            moveItemUp,
            moveItemDown,
            handleDragEnd,
            onSave: handleSave,
            onCancel: cancelEdit,
            isLoading: updateMutation.isPending,
        },
    };
}
