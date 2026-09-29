import type { TrashMyRankingListType } from "../../../domain";

export type GetTrashListMyRankingResultType = {
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
  }[];
  total: number;
  totalPages: number;
};

/**
 * ゴミ箱のランキング一覧取得結果 DTO
 */
export class GetTrashListMyRankingResultDto {
  private readonly _value: GetTrashListMyRankingResultType;

  /**
   * @param list 現在のページの削除済みランキング一覧
   * @param total 絞り込み条件に一致する全件数
   * @param totalPages 総ページ数
   */
  constructor(list: TrashMyRankingListType[], total: number, totalPages: number) {
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
      })),
      total,
      totalPages,
    };
  }

  get value(): GetTrashListMyRankingResultType {
    return this._value;
  }
}
