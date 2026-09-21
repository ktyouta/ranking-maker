export const TRASH_SORT_OPTIONS = [
    { value: 'updatedAtDesc', label: '更新日 ↓' },
    { value: 'updatedAtAsc', label: '更新日 ↑' },
    { value: 'createdAtDesc', label: '登録日 ↓' },
    { value: 'createdAtAsc', label: '登録日 ↑' },
    { value: 'itemCountDesc', label: '項目数 ↓' },
    { value: 'itemCountAsc', label: '項目数 ↑' },
] as const;

export type TrashSortType = (typeof TRASH_SORT_OPTIONS)[number]['value'];

export const DEFAULT_TRASH_SORT: TrashSortType = 'updatedAtDesc';
