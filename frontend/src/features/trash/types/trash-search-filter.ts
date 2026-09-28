// 絞り込みに指定できるタグの上限（1ランキングに付けられるタグの上限と同じ）
export const MAX_FILTER_TAG_COUNT = 20;

export type TrashSearchFilter = {
    keyword: string;
    createdAtFrom: string | null;
    createdAtTo: string | null;
    updatedAtFrom: string | null;
    updatedAtTo: string | null;
    tags: string[];
};

export const initialTrashSearchFilter: TrashSearchFilter = {
    keyword: '',
    createdAtFrom: null,
    createdAtTo: null,
    updatedAtFrom: null,
    updatedAtTo: null,
    tags: [],
};
