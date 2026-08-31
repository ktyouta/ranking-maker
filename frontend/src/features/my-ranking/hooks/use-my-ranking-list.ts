import { useDelayedFlag } from "@/hooks/use-delayed-flag";
import { useTransitionSearchParams } from "@/hooks/use-transition-search-params";
import { formatDate } from "@/utils/date-util";
import { useMemo, useState } from "react";
import { useMyRankings } from "../api/get-my-rankings";
import { MY_RANKING_QUERY_KEY } from "../constants/my-ranking-query-params";
import { initialMyRankingSearchFilter, MyRankingSearchFilter } from "../types/my-ranking-search-filter";

/**
 * マイランキング一覧画面用の状態を組み立てる
 */
export const useMyRankingList = () => {

    // クエリパラメータ取得・更新用
    const [searchParams, setSearchParams, isPending] = useTransitionSearchParams();
    // 初期検索条件
    const initSearchCondition: MyRankingSearchFilter = {
        title: searchParams.get(MY_RANKING_QUERY_KEY.TITLE) ?? '',
        createdAtFrom: searchParams.get(MY_RANKING_QUERY_KEY.CREATED_AT_FROM),
        createdAtTo: searchParams.get(MY_RANKING_QUERY_KEY.CREATED_AT_TO),
        updatedAtFrom: searchParams.get(MY_RANKING_QUERY_KEY.UPDATED_AT_FROM),
        updatedAtTo: searchParams.get(MY_RANKING_QUERY_KEY.UPDATED_AT_TO),
    };
    // 検索条件（フォーム入力中の値）
    const [searchCondition, setSearchCondition] = useState<MyRankingSearchFilter>(initSearchCondition);
    // 選択中のページ
    const pageParam = searchParams.get(MY_RANKING_QUERY_KEY.PAGE);
    const currentPage = pageParam && !Number.isNaN(Number(pageParam)) ? Number(pageParam) : 1;
    // ランキング一覧取得（Suspense対応のため取得中は呼び出し元で中断される）
    const rankingListQuery = useMyRankings({ searchParams });
    // オーバーレイ表示フラグ
    const isShowOverlay = useDelayedFlag(isPending, 250);

    // 画面表示用に整形したランキング一覧
    const rankingList = useMemo(() => {
        return rankingListQuery.data.data.list.map((ranking) => ({
            id: ranking.id,
            title: ranking.title,
            createdAt: formatDate(ranking.createdAt),
            itemCount: ranking.itemCount,
        }));
    }, [rankingListQuery.data]);

    /**
     * 検索条件クリア
     */
    function clearSearchCondition() {
        setSearchCondition(initialMyRankingSearchFilter);
        setSearchParams({});
    }

    /**
     * 検索ボタン押下イベント
     */
    function clickSearch() {
        const params: Record<string, string> = {};
        if (searchCondition.title) {
            params[MY_RANKING_QUERY_KEY.TITLE] = searchCondition.title;
        }
        if (searchCondition.createdAtFrom) {
            params[MY_RANKING_QUERY_KEY.CREATED_AT_FROM] = searchCondition.createdAtFrom;
        }
        if (searchCondition.createdAtTo) {
            params[MY_RANKING_QUERY_KEY.CREATED_AT_TO] = searchCondition.createdAtTo;
        }
        if (searchCondition.updatedAtFrom) {
            params[MY_RANKING_QUERY_KEY.UPDATED_AT_FROM] = searchCondition.updatedAtFrom;
        }
        if (searchCondition.updatedAtTo) {
            params[MY_RANKING_QUERY_KEY.UPDATED_AT_TO] = searchCondition.updatedAtTo;
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
            params[MY_RANKING_QUERY_KEY.PAGE] = page.toString();
        } else {
            delete params[MY_RANKING_QUERY_KEY.PAGE];
        }
        setSearchParams(params);
    }

    return {
        rankingList,
        total: rankingListQuery.data.data.total,
        totalPages: rankingListQuery.data.data.totalPages,
        currentPage,
        searchCondition,
        setSearchCondition,
        clearSearchCondition,
        clickSearch,
        handleKeyPress,
        changePage,
        isShowOverlay,
    };
}
