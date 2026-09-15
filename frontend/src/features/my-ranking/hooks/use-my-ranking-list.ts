import { useIcons } from "@/app/api/get-icons";
import { paths } from "@/config/paths";
import { useAppNavigation } from "@/hooks/use-app-navigation";
import { useDelayedFlag } from "@/hooks/use-delayed-flag";
import { useTransitionSearchParams } from "@/hooks/use-transition-search-params";
import { downloadBlobFile } from "@/utils/download-blob-file";
import { formatDaysAgo } from "@/utils/date-util";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useExportMyRankingCsvMutation } from "../api/export-my-ranking-csv";
import { MyRankingListQueryDataType, useMyRankings } from "../api/get-my-rankings";
import { myRankingKeys } from "../api/query-key";
import { useToggleMyRankingFavoriteMutation } from "../api/toggle-my-ranking-favorite";
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
        keyword: searchParams.get(MY_RANKING_QUERY_KEY.KEYWORD) ?? '',
        createdAtFrom: searchParams.get(MY_RANKING_QUERY_KEY.CREATED_AT_FROM),
        createdAtTo: searchParams.get(MY_RANKING_QUERY_KEY.CREATED_AT_TO),
        updatedAtFrom: searchParams.get(MY_RANKING_QUERY_KEY.UPDATED_AT_FROM),
        updatedAtTo: searchParams.get(MY_RANKING_QUERY_KEY.UPDATED_AT_TO),
        favoriteOnly: searchParams.get(MY_RANKING_QUERY_KEY.FAVORITE_ONLY) === 'true',
    };
    // 検索条件（フォーム入力中の値）
    const [searchCondition, setSearchCondition] = useState<MyRankingSearchFilter>(initSearchCondition);
    // 選択中のページ
    const pageParam = searchParams.get(MY_RANKING_QUERY_KEY.PAGE);
    const currentPage = pageParam && !Number.isNaN(Number(pageParam)) ? Number(pageParam) : 1;
    // ランキング一覧取得（Suspense対応のため取得中は呼び出し元で中断される）
    const rankingListQuery = useMyRankings({ searchParams });
    // アイコン候補一覧（idからemojiを引くために使用）
    const iconsQuery = useIcons();
    const icons = iconsQuery.data.data;
    // オーバーレイ表示フラグ
    const isShowOverlay = useDelayedFlag(isPending, 250);
    const queryClient = useQueryClient();
    // ルーティング用
    const { appNavigate } = useAppNavigation();

    // 画面表示用に整形したランキング一覧
    const rankingList = useMemo(() => {
        return rankingListQuery.data.data.list.map((ranking) => ({
            id: ranking.id,
            title: ranking.title,
            icon: icons.find((icon) => icon.id === ranking.icon)?.emoji ?? '',
            itemCount: ranking.itemCount,
            updatedAt: formatDaysAgo(ranking.updatedAt),
            isFavorite: ranking.isFavorite,
        }));
    }, [rankingListQuery.data, icons]);

    // お気に入り登録・解除
    const toggleFavoriteMutation = useToggleMyRankingFavoriteMutation({
        // APIコール前の楽観的更新
        onMutate: async ({ rankingId, isFavorite }) => {

            await queryClient.cancelQueries({ queryKey: myRankingKeys.lists() });

            const previousData = queryClient.getQueriesData<MyRankingListQueryDataType>({
                queryKey: myRankingKeys.lists(),
            });

            queryClient.setQueriesData<MyRankingListQueryDataType>(
                { queryKey: myRankingKeys.lists() },
                (prev) => {
                    if (!prev) {
                        return prev;
                    }
                    return {
                        ...prev,
                        data: {
                            ...prev.data,
                            list: prev.data.list.map((ranking) => {
                                return ranking.id === rankingId ? { ...ranking, isFavorite } : ranking
                            }),
                        },
                    };
                }
            );
            return { previousData };
        },
        onError: (context, message) => {
            // 失敗時はキャッシュから復元
            context?.previousData.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
            });
            toast.error(message);
        },
    });

    /**
     * お気に入りボタン押下イベント
     */
    const toggleFavorite = useCallback((id: string, isFavorite: boolean) => {
        toggleFavoriteMutation.mutate({ rankingId: id, isFavorite: !isFavorite });
    }, [toggleFavoriteMutation]);

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

    // CSVエクスポート
    const exportCsvMutation = useExportMyRankingCsvMutation({
        onSuccess: (result) => {
            if (result.isEmpty) {
                toast.info(result.message);
                return;
            }
            downloadBlobFile(result.filename, result.csvBlob);
        },
        onError: (message) => {
            toast.error(message);
        },
    });

    // 現在ページの行がすべて選択済みか（チェックボックスの表示状態に使用）
    const isAllSelectedOnPage = rankingList.length > 0
        && rankingList.every((ranking) => selectedIds.includes(ranking.id));

    /**
     * 現在ページの行の全選択・全解除を切り替える
     */
    const toggleSelectAllOnPage = useCallback(() => {
        setSelectedForIds(rankingList.map((ranking) => ranking.id), !isAllSelectedOnPage);
    }, [setSelectedForIds, rankingList, isAllSelectedOnPage]);

    /**
     * 選択中のランキングをCSV出力
     */
    const exportSelectedCsv = useCallback(() => {
        exportCsvMutation.mutate(selectedIds);
    }, [exportCsvMutation, selectedIds]);

    // 選択中IDの集合（一覧描画時の選択判定に使用）
    const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

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
        if (searchCondition.keyword) {
            params[MY_RANKING_QUERY_KEY.KEYWORD] = searchCondition.keyword;
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
        if (searchCondition.favoriteOnly) {
            params[MY_RANKING_QUERY_KEY.FAVORITE_ONLY] = 'true';
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

    /**
     * ランキングカードクリック（選択モード中は選択トグル、それ以外は詳細画面へ遷移）
     */
    const handleCardClick = useCallback((id: string) => {
        if (isSelectionMode) {
            toggleSelect(id);
            return;
        }
        appNavigate(paths.rankingDetail.getHref(id));
    }, [isSelectionMode, toggleSelect, appNavigate]);

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
        onToggleFavorite: toggleFavorite,
        isSelectionMode,
        selectedIdSet,
        selectedCount: selectedIds.length,
        onToggleSelectionMode: toggleSelectionMode,
        onToggleSelect: toggleSelect,
        isAllSelectedOnPage,
        onToggleSelectAllOnPage: toggleSelectAllOnPage,
        onExportCsv: exportSelectedCsv,
        isExporting: exportCsvMutation.isPending,
        onSelectRanking: handleCardClick,
    };
}
