// ゴミ箱一覧・詳細・一覧の絞り込み候補タグ取得用のキー
export const trashKeys = {
    all: ['trash'] as const,
    lists: () => [...trashKeys.all, 'list'] as const,
    list: (searchParams: URLSearchParams) => [...trashKeys.lists(), Object.fromEntries(searchParams)] as const,
    details: () => [...trashKeys.all, 'detail'] as const,
    detail: (id: string) => [...trashKeys.details(), id] as const,
    filterTags: () => [...trashKeys.all, 'filterTags'] as const,
};
