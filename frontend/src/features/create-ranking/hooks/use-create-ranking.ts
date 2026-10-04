import { useIcons } from '@/app/api/get-icons';
import { fetchMyRankingDetail } from '@/app/api/get-my-ranking';
import { useTags } from '@/app/api/get-tags';
import { myRankingKeys, tagKeys } from '@/app/api/query-key';
import { paths } from '@/config/paths';
import { PUBLIC_STATUS } from '@/constants/public-status';
import { TAG_NAME_SEPARATOR } from '@/constants/tag-name';
import { useSwitch } from '@/hooks/use-switch';
import { KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCreateRankingMutation, type ViolationType } from '../api/create-ranking';
import { MAX_TAG_COUNT, TAG_NAME_MAX_LENGTH } from '../types/create-ranking-request-type';
import { getCreateRankingDefaultValues, useCreateRankingForm } from './use-create-ranking.form';

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
    const { register, handleSubmit, watch, setValue, reset, formState: { errors }, itemFieldArray } = useCreateRankingForm();
    // アイコン候補一覧
    const iconsQuery = useIcons();
    const icons = iconsQuery.data.data;
    // アイコン選択ダイアログの開閉
    const iconDialog = useSwitch();
    // テンプレート選択ダイアログの開閉
    const templateDialog = useSwitch();
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
    // クリア確認ダイアログの開閉
    const clearDialog = useSwitch();
    // 作成リクエスト
    const postMutation = useCreateRankingMutation({
        // 正常終了後の処理
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: myRankingKeys.lists() });
            queryClient.invalidateQueries({ queryKey: myRankingKeys.filterTags() });
            queryClient.invalidateQueries({ queryKey: tagKeys.all });
            toast.success(data.message);
            navigate(paths.myRanking.path);
        },
        // 失敗後の処理
        onError: (message, errViolations) => {
            setErrMessage(message);
            window.scrollTo({ top: 0, behavior: "smooth" });
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
        if (tagName.includes(TAG_NAME_SEPARATOR)) {
            setTagErrMessage(`タグに「${TAG_NAME_SEPARATOR}」は使えません`);
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

    /**
     * テンプレート選択ダイアログを開く
     */
    const openTemplateDialog = useCallback(() => {
        templateDialog.on();
    }, [templateDialog]);

    /**
     * テンプレート選択ダイアログを閉じる
     */
    const closeTemplateDialog = useCallback(() => {
        templateDialog.off();
    }, [templateDialog]);

    /**
     * テンプレートとなるランキングを選択（詳細取得しフォームへ反映してダイアログを閉じる）
     */
    const selectTemplate = useCallback(async (rankingId: string) => {
        try {
            const detail = await fetchMyRankingDetail(queryClient, rankingId);
            // ランキング本体と項目一覧・タグ一覧
            const { ranking, items, tags } = detail.data;
            // 項目一覧を順位順に整形したもの
            const sortedItems = [...items].sort((a, b) => a.order - b.order);
            reset({
                title: ranking.title,
                isPublic: false,
                icon: ranking.icon,
                memo: ranking.memo ?? ``,
                items: sortedItems.map((item) => ({
                    itemName: item.itemName ?? ``,
                    memo: item.itemMemo ?? ``,
                })),
                tags: tags.map((tag) => tag.name),
            });
            templateDialog.off();
        } catch {
            toast.error('テンプレートの取得に失敗しました');
        }
    }, [queryClient, reset, templateDialog]);

    /**
     * クリアボタン押下
     */
    const clickClear = useCallback(() => {
        clearDialog.on();
    }, [clearDialog]);

    /**
     * キャンセルクリア
     */
    const cancelClear = useCallback(() => {
        clearDialog.off();
    }, [clearDialog]);

    /**
     * 入力値クリア
     */
    const confirmClear = useCallback(() => {
        reset(getCreateRankingDefaultValues());
        clearDialog.off();
    }, [reset, clearDialog]);

    return {
        errMessage,
        violations,
        register,
        errors,
        items: itemFieldArray.fields,
        sensors,
        addItem,
        removeItem,
        moveItemUp,
        moveItemDown,
        handleDragEnd,
        isLoading: postMutation.isPending,
        handleConfirm,
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
        isTemplateDialogOpen: templateDialog.flag,
        openTemplateDialog,
        closeTemplateDialog,
        selectTemplate,
        isClearDialogOpen: clearDialog.flag,
        clickClear,
        cancelClear,
        confirmClear,
    };
}
