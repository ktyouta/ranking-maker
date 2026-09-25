import type { TrashMyRankingOrderType, TrashMyRankingType } from "../../../domain";

export type GetTrashMyRankingResultType = {
  ranking: {
    id: string;
    title: string;
    memo: string | null;
    createdAt: string;
    updatedAt: string;
    publicStatus: number;
    publicStatusName: string;
    icon: number;
  };
  rankingOrder: {
    id: string;
    itemName: string | null;
    itemMemo: string | null;
    order: number;
    createdAt: string;
  }[];
};

/**
 * ゴミ箱のランキング取得結果 DTO
 */
export class GetTrashMyRankingResultDto {
  private readonly _value: GetTrashMyRankingResultType;

  /**
   * @param ranking 削除済みランキング
   * @param rankingOrder 削除済みランキングのオーダー一覧
   */
  constructor(ranking: TrashMyRankingType, rankingOrder: TrashMyRankingOrderType[]) {
    this._value = {
      ranking: {
        id: ranking.id,
        title: ranking.title,
        memo: ranking.memo,
        createdAt: ranking.createdAt,
        updatedAt: ranking.updatedAt,
        publicStatus: ranking.publicStatus,
        publicStatusName: ranking.publicStatusName,
        icon: ranking.icon,
      },
      rankingOrder: rankingOrder.map((e) => ({
        id: e.id,
        itemName: e.itemName,
        itemMemo: e.itemMemo,
        order: e.order,
        createdAt: e.createdAt,
      })),
    };
  }

  get value(): GetTrashMyRankingResultType {
    return this._value;
  }
}
