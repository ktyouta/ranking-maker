// 認証チェック用のキー
export const verifyKeys = {
    all: ['verify'] as const,
};

// アイコン一覧取得用のキー
export const iconKeys = {
    all: ['icons'] as const,
};

// ランキング一覧取得APIのクエリパラメータ（検索条件）
export type MyRankingListParamsType = {
    keyword?: string;
    createdAtFrom?: string;
    createdAtTo?: string;
    updatedAtFrom?: string;
    updatedAtTo?: string;
    favoriteOnly?: string;
    sort?: string;
    page?: string;
};

// ランキング一覧・詳細取得用のキー
export const myRankingKeys = {
    all: ['myRanking'] as const,
    lists: () => [myRankingKeys.all, 'list'] as const,
    list: (params: MyRankingListParamsType) => [...myRankingKeys.lists(), params] as const,
    details: () => [...myRankingKeys.all, 'detail'] as const,
    detail: (id: string) => [...myRankingKeys.details(), id] as const,
};
