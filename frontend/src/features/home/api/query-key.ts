// ランキング一覧取得用のキー
export const rankingKeys = {
    all: ['ranking'] as const,
    lists: () => [rankingKeys.all, 'list'] as const,
    list: (props: URLSearchParams) => [...rankingKeys.lists(), Object.fromEntries(props)] as const,
    details: () => [...rankingKeys.all, 'detail'] as const,
    detail: (id: string) => [...rankingKeys.details(), id] as const,
};