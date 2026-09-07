import { PUBLIC_STATUS } from '@/constants/public-status';
import { myRankingKeys } from '@/features/my-ranking/api/query-key';
import { KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useMyRanking } from '../api/get-my-ranking';
import { useUpdateMyRankingMutation, ViolationType } from '../api/update-my-ranking';
import { useUpdateMyRankingForm } from './use-update-my-ranking.form';

const MIN_ITEM_COUNT = 1;

type PropsType = {
    onCancel: () => void;
    onSaveSuccess: () => void;
};

export function useMyRankingDetailEdit({ onCancel, onSaveSuccess }: PropsType) {

    const { rankingId } = useParams();
    if (!rankingId) {
        throw new Error('rankingIdが指定されていません');
    }

    const queryClient = useQueryClient();
    // エラーメッセージ
    const [errMessage, setErrMessage] = useState(``);
    // フィールド単位に紐付かないエラー一覧（バリデーション・不適切内容検出）
    const [violations, setViolations] = useState<ViolationType[]>([]);

    // ランキング取得（Suspense対応のため取得中は呼び出し元で中断される）
    const rankingQuery = useMyRanking(rankingId);
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
    const { register, handleSubmit, control, reset, formState: { errors }, itemFieldArray } = useUpdateMyRankingForm(defaultValues);
    // ポインター操作とキーボード操作の両方でドラッグ&ドロップを可能にする
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    // 更新リクエスト
    const updateMutation = useUpdateMyRankingMutation({
        rankingId,
        // 正常終了後の処理
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: myRankingKeys.detail(rankingId) });
            queryClient.invalidateQueries({ queryKey: myRankingKeys.lists() });
            toast.success(data.message);
            onSaveSuccess();
        },
        // 失敗後の処理
        onError: (message, errViolations) => {
            setErrMessage(message);
            window.scrollTo({ top: 0, behavior: "smooth" });
            setViolations(errViolations ?? []);
        },
    });

    /**
     * 編集キャンセル（閲覧モードへ戻す）
     */
    const cancelEdit = useCallback(() => {
        reset(defaultValues);
        setErrMessage(``);
        setViolations([]);
        onCancel();
    }, [reset, defaultValues, onCancel]);

    /**
     * ランキング更新実行
     */
    const handleSave = handleSubmit((data) => {
        updateMutation.mutate({
            title: data.title,
            // 公開設定UIは現状外しているため、常に非公開で送る
            publicStatus: PUBLIC_STATUS.PRIVATE,
            memo: data.memo,
            items: data.items.map((item, index) => ({
                itemName: item.itemName,
                memo: item.memo,
                order: index + 1,
            })),
        });
    }, () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
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
    };
}
