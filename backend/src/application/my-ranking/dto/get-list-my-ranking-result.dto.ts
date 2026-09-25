import type { MyRankingListType } from "../../../domain";

export type GetListMyRankingResultType = {
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
};

/**
 * ランキング一覧取得結果 DTO
 */
export class GetListMyRankingResultDto {
  private readonly _value: GetListMyRankingResultType;

  /**
   * @param list 現在のページのランキング一覧
   * @param total 絞り込み条件に一致する全件数
   */
  constructor(list: MyRankingListType[], total: number) {
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
    };
  }

  get value(): GetListMyRankingResultType {
    return this._value;
  }
}
