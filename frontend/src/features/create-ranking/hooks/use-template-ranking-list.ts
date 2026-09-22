import { useMyRankings } from '@/app/api/get-my-rankings';
import { useState } from 'react';

/**
 * テンプレート選択ダイアログの一覧取得・ページ送りを管理する
 */
export function useTemplateRankingList() {

    // 選択中のページ
    const [page, setPage] = useState(1);
    // ランキング一覧取得
    const rankingListQuery = useMyRankings({ page: String(page) });
    // ランキング一覧・件数
    const { list, totalPages } = rankingListQuery.data.data;

    return {
        list,
        totalPages,
        currentPage: page,
        onPageChange: setPage,
    };
}
