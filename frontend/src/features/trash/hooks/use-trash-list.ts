import { paths } from "@/config/paths";
import { useAppNavigation } from "@/hooks/use-app-navigation";
import { useDelayedFlag } from "@/hooks/use-delayed-flag";
import { useTransitionSearchParams } from "@/hooks/use-transition-search-params";
import { formatDate } from "@/utils/date-util";
import { useCallback, useMemo, useState } from "react";
import { useTrashList } from "../api/get-trash-list";
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
        title: searchParams.get(TRASH_QUERY_KEY.TITLE) ?? '',
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
    // オーバーレイ表示フラグ
    const isShowOverlay = useDelayedFlag(isPending, 250);

    // 画面表示用に整形したゴミ箱一覧
    const trashList = useMemo(() => {
        return trashListQuery.data.data.list.map((ranking) => ({
            id: ranking.id,
            title: ranking.title,
            itemCount: ranking.itemCount,
            createdAt: formatDate(ranking.createdAt),
        }));
    }, [trashListQuery.data]);

    /**
     * ゴミ箱詳細画面へ遷移
     */
    const selectTrash = useCallback((id: string) => {
        appNavigate(paths.trashDetail.getHref(id));
    }, [appNavigate]);

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
        if (searchCondition.title) {
            params[TRASH_QUERY_KEY.TITLE] = searchCondition.title;
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
    };
}
