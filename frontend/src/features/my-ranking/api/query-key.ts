// ランキング一覧取得用のキー
export const myRankingKeys = {
    all: ['myRanking'] as const,
    lists: () => [myRankingKeys.all, 'list'] as const,
    list: (props: URLSearchParams) => [...myRankingKeys.lists(), Object.fromEntries(props)] as const,
    details: () => [...myRankingKeys.all, 'detail'] as const,
    detail: (id: string) => [...myRankingKeys.details(), id] as const,
};