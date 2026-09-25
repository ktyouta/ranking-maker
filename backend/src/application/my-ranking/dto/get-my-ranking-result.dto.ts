import type { MyRankingOrderType, MyRankingType } from "../../../domain";

export type GetMyRankingResultType = {
  ranking: {
    id: string;
    title: string;
    memo: string | null;
    createdAt: string;
    updatedAt: string;
    publicStatus: number;
    publicStatusName: string;
    icon: number;
    isFavorite: boolean;
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
 * ランキング取得結果 DTO
 */
export class GetMyRankingResultDto {
  private readonly _value: GetMyRankingResultType;

  /**
   * @param ranking ランキング
   * @param rankingOrder ランキングオーダー一覧
   */
  constructor(ranking: MyRankingType, rankingOrder: MyRankingOrderType[]) {
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
        isFavorite: ranking.isFavorite,
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

  get value(): GetMyRankingResultType {
    return this._value;
  }
}
