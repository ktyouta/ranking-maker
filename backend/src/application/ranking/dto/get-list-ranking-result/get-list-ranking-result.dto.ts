import type { RankingListType } from "../../../../domain";

export type GetListRankingResultType = {
  list: {
    id: string;
    title: string;
    userName: string;
    createdAt: string;
    updatedAt: string;
    publicStatus: number;
    publicStatusName: string;
    icon: number;
    itemCount: number;
    isFavorite: boolean;
  }[];
  total: number;
  totalPages: number;
};

/**
 * ランキング一覧取得結果 DTO
 */
export class GetListRankingResultDto {
  private readonly _value: GetListRankingResultType;

  /**
   * @param list 現在のページのランキング一覧
   * @param total 絞り込み条件に一致する全件数
   * @param totalPages 総ページ数
   */
  constructor(list: RankingListType[], total: number, totalPages: number) {
    this._value = {
      list: list.map((e) => ({
        id: e.id,
        title: e.title,
        userName: e.userName,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
        publicStatus: e.publicStatus,
        publicStatusName: e.publicStatusName,
        icon: e.icon,
        itemCount: e.itemCount,
        isFavorite: e.isFavorite,
      })),
      total,
      totalPages,
    };
  }

  get value(): GetListRankingResultType {
    return this._value;
  }
}
