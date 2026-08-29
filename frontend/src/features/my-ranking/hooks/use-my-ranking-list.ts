import { formatDate } from "@/utils/date-util";
import { useMemo } from "react";
import { useMyRankings } from "../api/get-my-rankings";

/**
 * マイランキング一覧画面用の状態を組み立てる
 */
export const useMyRankingList = () => {

    // ランキング一覧取得（Suspense対応のため取得中は呼び出し元で中断される）
    const rankingListQuery = useMyRankings();

    // 画面表示用に整形したランキング一覧
    const rankingList = useMemo(() => {
        return rankingListQuery.data.data.map((ranking) => ({
            id: ranking.id,
            title: ranking.title,
            createdAt: formatDate(ranking.createdAt),
            itemCount: ranking.itemCount,
        }));
    }, [rankingListQuery.data]);

    return {
        rankingList,
    }
}
