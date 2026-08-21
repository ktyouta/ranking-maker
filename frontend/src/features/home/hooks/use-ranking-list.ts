import { useMemo } from "react";
import { useRankingListQuery } from "../api/ranking";

/**
 * 日付を YYYY/MM/DD 形式に整形する
 */
function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}/${month}/${day}`;
}

/**
 * ホーム画面（みんなの公開ランキング一覧）用の状態を組み立てる
 */
export const useRankingList = () => {

    // ランキング一覧取得（Suspense対応のため取得中は呼び出し元で中断される）
    const rankingListQuery = useRankingListQuery();

    // 画面表示用に整形したランキング一覧
    const rankingList = useMemo(() => {
        return rankingListQuery.data.data.map((ranking) => ({
            id: ranking.id,
            title: ranking.title,
            userName: ranking.userName,
            createdAt: formatDate(ranking.createdAt),
        }));
    }, [rankingListQuery.data]);

    return {
        rankingList,
    }
}
