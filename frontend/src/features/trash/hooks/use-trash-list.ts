import { useIcons } from "@/app/api/get-icons";
import { paths } from "@/config/paths";
import { useAppNavigation } from "@/hooks/use-app-navigation";
import { useDelayedFlag } from "@/hooks/use-delayed-flag";
import { useSwitch } from "@/hooks/use-switch";
import { useTransitionSearchParams } from "@/hooks/use-transition-search-params";
import { formatDaysAgo } from "@/utils/date-util";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useBulkRestoreTrashMutation } from "../api/bulk-restore-trash";
import { useTrashList } from "../api/get-trash-list";
import { trashKeys } from "../api/query-key";
import { TRASH_QUERY_KEY } from "../constants/trash-query-params";
import { initialTrashSearchFilter, TrashSearchFilter } from "../types/trash-search-filter";

/**
 * ゴミ箱一覧画面用の状態を組み立てる
 */
export function useTrashListScreen() {

    // ルーティング用
    const { appNavigate } = useAppNavigation();
    // クエリパラメータ取得・更新用
    const [searchParams, setSearchParams, isPending] = useTransitionSearchParams();
    // 初期検索条件
    const initSearchCondition: TrashSearchFilter = {
        keyword: searchParams.get(TRASH_QUERY_KEY.KEYWORD) ?? '',
        createdAtFrom: searchParams.get(TRASH_QUERY_KEY.CREATED_AT_FROM),
        createdAtTo: searchParams.get(TRASH_QUERY_KEY.CREATED_AT_TO),
        updatedAtFrom: searchParams.get(TRASH_QUERY_KEY.UPDATED_AT_FROM),
        updatedAtTo: searchParams.get(TRASH_QUERY_KEY.UPDATED_AT_TO),
    };
    // 検索条件（フォーム入力中の値）
    const [searchCondition, setSearchCondition] = useState<TrashSearchFilter>(initSearchCondition);
    // 選択中のページ
    const pageParam = searchParams.get(TRASH_QUERY_KEY.PAGE);
    const currentPage = pageParam && !Number.isNaN(Number(pageParam)) ? Number(pageParam) : 1;
    // ゴミ箱一覧取得
    const trashListQuery = useTrashList({ searchParams });
    // アイコン候補一覧（idからemojiを引くために使用）
    const iconsQuery = useIcons();
    const icons = iconsQuery.data.data;
    // オーバーレイ表示フラグ
    const isShowOverlay = useDelayedFlag(isPending, 250);
    const queryClient = useQueryClient();

    // 画面表示用に整形したゴミ箱一覧
    const trashList = useMemo(() => {
        return trashListQuery.data.data.list.map((ranking) => ({
            id: ranking.id,
            title: ranking.title,
            icon: icons.find((icon) => icon.id === ranking.icon)?.emoji ?? '',
            itemCount: ranking.itemCount,
            updatedAt: formatDaysAgo(ranking.updatedAt),
        }));
    }, [trashListQuery.data, icons]);

    // 選択モードのON/OFF
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    // 選択中のランキングID（ページ送りしても保持する）
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    /**
     * 選択モードの切り替え（OFFにする際は選択状態もクリアする）
     */
    const toggleSelectionMode = useCallback(() => {
        setIsSelectionMode((prev) => {
            if (prev) {
                setSelectedIds([]);
            }
            return !prev;
        });
    }, []);

    /**
     * 1件の選択トグル
     */
    const toggleSelect = useCallback((id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
        );
    }, []);

    /**
     * 指定idの選択状態をまとめて設定する
     */
    const setSelectedForIds = useCallback((ids: string[], selected: boolean) => {
        setSelectedIds((prev) => {
            if (selected) {
                return Array.from(new Set([...prev, ...ids]));
            }
            return prev.filter((id) => !ids.includes(id));
        });
    }, []);

    // 現在ページの行がすべて選択済みか（チェックボックスの表示状態に使用）
    const isAllSelectedOnPage = trashList.length > 0
        && trashList.every((ranking) => selectedIds.includes(ranking.id));

    /**
     * 現在ページの行の全選択・全解除を切り替える
     */
    const toggleSelectAllOnPage = useCallback(() => {
        setSelectedForIds(trashList.map((ranking) => ranking.id), !isAllSelectedOnPage);
    }, [setSelectedForIds, trashList, isAllSelectedOnPage]);

    // 選択中IDの集合（一覧描画時の選択判定に使用）
    const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

    // 一括復元確認ダイアログの開閉
    const bulkRestoreDialog = useSwitch();

    // 一括復元
    const bulkRestoreMutation = useBulkRestoreTrashMutation({
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: trashKeys.lists() });
            setSelectedIds([]);
            setIsSelectionMode(false);
            toast.success(data.message);
        },
        onError: (message) => {
            toast.error(message);
        },
    });

    /**
     * 一括復元ボタン押下イベント（確認ダイアログを開く）
     */
    const clickBulkRestore = useCallback(() => {
        bulkRestoreDialog.on();
    }, [bulkRestoreDialog]);

    /**
     * 一括復元確認ダイアログを閉じる
     */
    const cancelBulkRestore = useCallback(() => {
        bulkRestoreDialog.off();
    }, [bulkRestoreDialog]);

    /**
     * 一括復元実行
     */
    const confirmBulkRestore = useCallback(() => {
        bulkRestoreDialog.off();
        bulkRestoreMutation.mutate(selectedIds);
    }, [bulkRestoreDialog, bulkRestoreMutation, selectedIds]);

    /**
     * ゴミ箱カードクリック（選択モード中は選択トグル、それ以外は詳細画面へ遷移）
     */
    const selectTrash = useCallback((id: string) => {
        if (isSelectionMode) {
            toggleSelect(id);
            return;
        }
        appNavigate(paths.trashDetail.getHref(id));
    }, [isSelectionMode, toggleSelect, appNavigate]);

    /**
     * 検索条件クリア
     */
    function clearSearchCondition() {
        setSearchCondition(initialTrashSearchFilter);
        setSearchParams({});
    }

    /**
     * 検索ボタン押下イベント
     */
    function clickSearch() {
        const params: Record<string, string> = {};
        if (searchCondition.keyword) {
            params[TRASH_QUERY_KEY.KEYWORD] = searchCondition.keyword;
        }
        if (searchCondition.createdAtFrom) {
            params[TRASH_QUERY_KEY.CREATED_AT_FROM] = searchCondition.createdAtFrom;
        }
        if (searchCondition.createdAtTo) {
            params[TRASH_QUERY_KEY.CREATED_AT_TO] = searchCondition.createdAtTo;
        }
        if (searchCondition.updatedAtFrom) {
            params[TRASH_QUERY_KEY.UPDATED_AT_FROM] = searchCondition.updatedAtFrom;
        }
        if (searchCondition.updatedAtTo) {
            params[TRASH_QUERY_KEY.UPDATED_AT_TO] = searchCondition.updatedAtTo;
        }
        setSearchParams(params);
    }

    /**
     * エンターキー押下時イベント
     */
    function handleKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter') {
            clickSearch();
        }
    }

    /**
     * ページ切り替えイベント
     */
    function changePage(page: number) {
        const params = Object.fromEntries(searchParams);
        if (page > 1) {
            params[TRASH_QUERY_KEY.PAGE] = page.toString();
        } else {
            delete params[TRASH_QUERY_KEY.PAGE];
        }
        setSearchParams(params);
    }

    return {
        trashList,
        total: trashListQuery.data.data.total,
        totalPages: trashListQuery.data.data.totalPages,
        currentPage,
        onSelectTrash: selectTrash,
        searchCondition,
        setSearchCondition,
        clearSearchCondition,
        clickSearch,
        handleKeyPress,
        changePage,
        isShowOverlay,
        isSelectionMode,
        selectedIdSet,
        selectedCount: selectedIds.length,
        onToggleSelectionMode: toggleSelectionMode,
        onToggleSelect: toggleSelect,
        isAllSelectedOnPage,
        onToggleSelectAllOnPage: toggleSelectAllOnPage,
        isBulkRestoreDialogOpen: bulkRestoreDialog.flag,
        onClickBulkRestore: clickBulkRestore,
        onCancelBulkRestore: cancelBulkRestore,
        onConfirmBulkRestore: confirmBulkRestore,
        isBulkRestoring: bulkRestoreMutation.isPending,
    };
}
