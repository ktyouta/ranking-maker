export const RANKING_SORT_OPTIONS = [
    { value: 'updatedAtDesc', label: '更新日 ↓' },
    { value: 'updatedAtAsc', label: '更新日 ↑' },
    { value: 'createdAtDesc', label: '登録日 ↓' },
    { value: 'createdAtAsc', label: '登録日 ↑' },
    { value: 'itemCountDesc', label: '項目数 ↓' },
    { value: 'itemCountAsc', label: '項目数 ↑' },
    { value: 'favoriteDesc', label: 'お気に入り' },
] as const;

export type RankingSortType = (typeof RANKING_SORT_OPTIONS)[number]['value'];

export const DEFAULT_RANKING_SORT: RankingSortType = 'updatedAtDesc';
