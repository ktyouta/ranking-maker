// ゴミ箱一覧・詳細取得用のキー
export const trashKeys = {
    all: ['trash'] as const,
    lists: () => [trashKeys.all, 'list'] as const,
    details: () => [...trashKeys.all, 'detail'] as const,
    detail: (id: string) => [...trashKeys.details(), id] as const,
};
