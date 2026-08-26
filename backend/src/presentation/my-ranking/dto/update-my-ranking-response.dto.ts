import type { RankingAggregate } from "../../../domain";

export type UpdateMyRankingResponseType = {
  id: string;
  title: string;
  publicStatus: number;
  memo: string | null;
  items: {
    id: string;
    itemName: string | null;
    order: number;
    memo: string | null;
  }[];
};

/**
 * ランキング更新レスポンス DTO
 * 永続化した集約を唯一の情報源として組み立てる（DB の再取得はしない）。
 */
export class UpdateMyRankingResponseDto {
  private readonly _value: UpdateMyRankingResponseType;

  constructor(aggregate: RankingAggregate) {
    this._value = {
      id: aggregate.id,
      title: aggregate.title,
      publicStatus: aggregate.publicStatus,
      memo: aggregate.memo,
      items: aggregate.rankingOrderEntityList.map((e) => ({
        id: e.id,
        itemName: e.itemName,
        order: e.order,
        memo: e.memo,
      })),
    };
  }

  get value(): UpdateMyRankingResponseType {
    return this._value;
  }
}
