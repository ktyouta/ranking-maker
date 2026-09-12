export type TrashSearchFilter = {
    keyword: string;
    createdAtFrom: string | null;
    createdAtTo: string | null;
    updatedAtFrom: string | null;
    updatedAtTo: string | null;
};

export const initialTrashSearchFilter: TrashSearchFilter = {
    keyword: '',
    createdAtFrom: null,
    createdAtTo: null,
    updatedAtFrom: null,
    updatedAtTo: null,
};
