// 認証チェック用のキー
export const verifyKeys = {
    all: ['verify'] as const,
};

// アイコン一覧取得用のキー
export const iconKeys = {
    all: ['icons'] as const,
};

// タグ一覧取得用のキー
export const tagKeys = {
    all: ['tags'] as const,
};

// ランキング一覧取得APIのクエリパラメータ（検索条件）
export type MyRankingListParamsType = {
    keyword?: string;
    createdAtFrom?: string;
    createdAtTo?: string;
    updatedAtFrom?: string;
    updatedAtTo?: string;
    favoriteOnly?: string;
    tags?: string;
    sort?: string;
    page?: string;
};

// ランキング一覧・詳細・一覧の絞り込み候補タグ取得用のキー
export const myRankingKeys = {
    all: ['myRanking'] as const,
    lists: () => [myRankingKeys.all, 'list'] as const,
    list: (params: MyRankingListParamsType) => [...myRankingKeys.lists(), params] as const,
    details: () => [...myRankingKeys.all, 'detail'] as const,
    detail: (id: string) => [...myRankingKeys.details(), id] as const,
    filterTags: () => [...myRankingKeys.all, 'filterTags'] as const,
};
