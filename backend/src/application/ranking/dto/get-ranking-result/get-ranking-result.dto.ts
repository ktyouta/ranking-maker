import type { RankingOrderType, RankingTagType, RankingType } from "../../../../domain";

export type GetRankingResultType = {
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
  items: {
    id: string;
    itemName: string | null;
    itemMemo: string | null;
    order: number;
    createdAt: string;
  }[];
  tags: {
    name: string;
  }[];
};

/**
 * ランキング取得結果 DTO
 */
export class GetRankingResultDto {
  private readonly _value: GetRankingResultType;

  /**
   * @param ranking ランキング
   * @param rankingOrder ランキングオーダー一覧
   */
  constructor(ranking: RankingType, rankingOrder: RankingOrderType[], rankingTag: RankingTagType[]) {
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
      items: rankingOrder.map((e) => ({
        id: e.id,
        itemName: e.itemName,
        itemMemo: e.itemMemo,
        order: e.order,
        createdAt: e.createdAt,
      })),
      tags: rankingTag.map((e) => ({
        name: e.name
      }))
    };
  }

  get value(): GetRankingResultType {
    return this._value;
  }
}
