import { paths } from '@/config/paths';
import { PUBLIC_STATUS } from '@/constants/public-status';
import { myRankingKeys } from '@/features/my-ranking/api/query-key';
import { KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCreateRankingMutation, ViolationType } from '../api/create-ranking';
import { useCreateRankingForm } from './use-create-ranking.form';

const MIN_ITEM_COUNT = 1;

export function useCreateRanking() {

    // ルーティング用
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    // エラーメッセージ
    const [errMessage, setErrMessage] = useState(``);
    // フィールド単位に紐付かないエラー一覧（バリデーション・不適切内容検出）
    const [violations, setViolations] = useState<ViolationType[]>([]);
    // フォーム
    const { register, handleSubmit, control, formState: { errors }, itemFieldArray } = useCreateRankingForm();
    // ポインター操作とキーボード操作の両方でドラッグ&ドロップを可能にする
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );
    // 作成リクエスト
    const postMutation = useCreateRankingMutation({
        // 正常終了後の処理
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: myRankingKeys.lists() });
            toast.success(data.message);
            navigate(paths.myRanking.path);
        },
        // 失敗後の処理
        onError: (message, errViolations) => {
            setErrMessage(message);
            setViolations(errViolations ?? []);
        },
    });

    /**
     * ランキング作成実行
     */
    const handleConfirm = handleSubmit((data) => {
        postMutation.mutate({
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

    /**
     * 戻るボタン押下
     */
    const back = useCallback(() => {
        navigate(paths.myRanking.path);
    }, [navigate]);

    return {
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
        back,
        isLoading: postMutation.isPending,
        handleConfirm,
    };
}
