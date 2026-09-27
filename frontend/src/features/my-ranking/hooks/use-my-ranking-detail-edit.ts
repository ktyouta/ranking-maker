import { useIcons } from '@/app/api/get-icons';
import { useMyRanking } from '@/app/api/get-my-ranking';
import { useTags } from '@/app/api/get-tags';
import { myRankingKeys, tagKeys } from '@/app/api/query-key';
import { PUBLIC_STATUS } from '@/constants/public-status';
import { useSwitch } from '@/hooks/use-switch';
import { KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState, type KeyboardEvent } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useUpdateMyRankingMutation, ViolationType } from '../api/update-my-ranking';
import { MAX_TAG_COUNT, TAG_NAME_MAX_LENGTH } from '../types/update-my-ranking-request-type';
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
    // ランキング本体と項目一覧・タグ一覧
    const { ranking, items, tags } = rankingQuery.data.data;

    // 項目一覧を順位順に整形したもの
    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => a.order - b.order);
    }, [items]);

    // 編集フォームの初期値
    const defaultValues = useMemo(() => ({
        title: ranking.title,
        isPublic: ranking.publicStatus === PUBLIC_STATUS.PUBLIC,
        icon: ranking.icon,
        memo: ranking.memo ?? ``,
        items: sortedItems.map((item) => ({
            itemName: item.itemName ?? ``,
            memo: item.itemMemo ?? ``,
        })),
        tags: tags.map((tag) => tag.name),
    }), [ranking, sortedItems, tags]);

    // フォーム
    const { register, handleSubmit, control, reset, watch, setValue, formState: { errors }, itemFieldArray } = useUpdateMyRankingForm(defaultValues);
    // アイコン候補一覧
    const iconsQuery = useIcons();
    const icons = iconsQuery.data.data;
    // アイコン選択ダイアログの開閉
    const iconDialog = useSwitch();
    // 選択中のアイコンID
    const selectedIconId = watch('icon');
    // これまでに使ったタグ（タグ設定ダイアログの候補）
    const tagsQuery = useTags();
    const candidateTags = tagsQuery.data.data.map((tag) => tag.name);
    // タグ設定ダイアログの開閉
    const tagDialog = useSwitch();
    // タグ設定ダイアログの入力欄
    const [tagInput, setTagInput] = useState(``);
    // タグ設定ダイアログ内のエラーメッセージ
    const [tagErrMessage, setTagErrMessage] = useState(``);
    // 付けているタグ
    const selectedTags = watch('tags');
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
            queryClient.invalidateQueries({ queryKey: tagKeys.all });
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
            icon: data.icon,
            memo: data.memo,
            items: data.items.map((item, index) => ({
                itemName: item.itemName,
                memo: item.memo,
                order: index + 1,
            })),
            tags: data.tags,
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

    /**
     * アイコン選択ダイアログを開く
     */
    const openIconDialog = useCallback(() => {
        iconDialog.on();
    }, [iconDialog]);

    /**
     * アイコン選択ダイアログを閉じる
     */
    const closeIconDialog = useCallback(() => {
        iconDialog.off();
    }, [iconDialog]);

    /**
     * アイコン選択
     */
    const selectIcon = useCallback((iconId: number) => {
        setValue('icon', iconId);
        iconDialog.off();
    }, [setValue, iconDialog]);

    /**
     * タグ設定ダイアログを開く
     */
    const openTagDialog = useCallback(() => {
        tagDialog.on();
    }, [tagDialog]);

    /**
     * タグ設定ダイアログを閉じる（入力途中の内容とエラーは破棄する）
     */
    const closeTagDialog = useCallback(() => {
        setTagInput(``);
        setTagErrMessage(``);
        tagDialog.off();
    }, [tagDialog]);

    /**
     * 入力欄のタグを付ける
     */
    const addTag = useCallback(() => {
        const tagName = tagInput.trim();
        if (!tagName) {
            return;
        }
        if (selectedTags.includes(tagName)) {
            setTagInput(``);
            setTagErrMessage(``);
            return;
        }
        if (tagName.length > TAG_NAME_MAX_LENGTH) {
            setTagErrMessage(`タグは${TAG_NAME_MAX_LENGTH}文字以内で入力してください`);
            return;
        }
        if (selectedTags.length >= MAX_TAG_COUNT) {
            setTagErrMessage(`タグは${MAX_TAG_COUNT}個までです`);
            return;
        }
        setValue('tags', [...selectedTags, tagName]);
        setTagInput(``);
        setTagErrMessage(``);
    }, [tagInput, selectedTags, setValue]);

    /**
     * 入力欄で Enter キーを押したらタグを付ける（日本語変換の確定操作では付けない）
     * @param event キー入力イベント
     */
    const keyDownTagInput = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter' || event.nativeEvent.isComposing) {
            return;
        }
        event.preventDefault();
        addTag();
    }, [addTag]);

    /**
     * これまでに使ったタグの付け外しを切り替える
     */
    const toggleTag = useCallback((tagName: string) => {
        if (selectedTags.includes(tagName)) {
            setValue('tags', selectedTags.filter((e) => e !== tagName));
            setTagErrMessage(``);
            return;
        }
        if (selectedTags.length >= MAX_TAG_COUNT) {
            setTagErrMessage(`タグは${MAX_TAG_COUNT}個までです`);
            return;
        }
        setValue('tags', [...selectedTags, tagName]);
        setTagErrMessage(``);
    }, [selectedTags, setValue]);

    /**
     * タグを外す
     */
    const removeTag = useCallback((tagName: string) => {
        setValue('tags', selectedTags.filter((e) => e !== tagName));
        setTagErrMessage(``);
    }, [selectedTags, setValue]);

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
        icons,
        selectedIconId,
        isIconDialogOpen: iconDialog.flag,
        openIconDialog,
        closeIconDialog,
        selectIcon,
        selectedTags,
        candidateTags,
        isTagDialogOpen: tagDialog.flag,
        openTagDialog,
        closeTagDialog,
        tagInput,
        changeTagInput: setTagInput,
        keyDownTagInput,
        addTag,
        toggleTag,
        removeTag,
        tagErrMessage,
    };
}
