import type { RankingOrderType, RankingType } from "../../../domain";

export type GetRankingResultType = {
  ranking: {
    id: string;
    title: string;
    userName: string;
    createdAt: string;
  };
  rankingOrder: {
    id: string;
    itemName: string | null;
    itemMemo: string | null;
    createdAt: string;
  }[];
};

/**
 * 公開ランキング取得結果 DTO
 */
export class GetRankingResultDto {
  private readonly _value: GetRankingResultType;

  /**
   * @param ranking 公開ランキング
   * @param rankingOrder ランキングオーダー一覧
   */
  constructor(ranking: RankingType, rankingOrder: RankingOrderType[]) {
    this._value = {
      ranking: {
        id: ranking.id,
        title: ranking.title,
        userName: ranking.userName,
        createdAt: ranking.createdAt,
      },
      rankingOrder: rankingOrder.map((e) => ({
        id: e.id,
        itemName: e.itemName,
        itemMemo: e.itemMemo,
        createdAt: e.createdAt,
      })),
    };
  }

  get value(): GetRankingResultType {
    return this._value;
  }
}
