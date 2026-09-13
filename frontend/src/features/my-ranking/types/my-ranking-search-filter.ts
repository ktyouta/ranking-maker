export type MyRankingSearchFilter = {
    keyword: string;
    createdAtFrom: string | null;
    createdAtTo: string | null;
    updatedAtFrom: string | null;
    updatedAtTo: string | null;
    favoriteOnly: boolean;
};

export const initialMyRankingSearchFilter: MyRankingSearchFilter = {
    keyword: '',
    createdAtFrom: null,
    createdAtTo: null,
    updatedAtFrom: null,
    updatedAtTo: null,
    favoriteOnly: false,
};
