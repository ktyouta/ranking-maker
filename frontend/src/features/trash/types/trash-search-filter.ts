export type TrashSearchFilter = {
    title: string;
    createdAtFrom: string | null;
    createdAtTo: string | null;
    updatedAtFrom: string | null;
    updatedAtTo: string | null;
};

export const initialTrashSearchFilter: TrashSearchFilter = {
    title: '',
    createdAtFrom: null,
    createdAtTo: null,
    updatedAtFrom: null,
    updatedAtTo: null,
};
