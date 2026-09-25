import type { RankingAggregate } from "../../../domain";

export type CreateMyRankingResultType = {
  id: string;
  title: string;
  publicStatus: number;
  icon: number;
  memo: string | null;
  items: {
    id: string;
    itemName: string | null;
    order: number;
    memo: string | null;
  }[];
};

/**
 * ランキング作成結果 DTO
 * 永続化した集約を唯一の情報源として組み立てる（DB の再取得はしない）。
 */
export class CreateMyRankingResultDto {
  private readonly _value: CreateMyRankingResultType;

  constructor(aggregate: RankingAggregate) {
    this._value = {
      id: aggregate.id,
      title: aggregate.title,
      publicStatus: aggregate.publicStatus,
      icon: aggregate.icon,
      memo: aggregate.memo,
      items: aggregate.rankingOrderEntityList.map((e) => ({
        id: e.id,
        itemName: e.itemName,
        order: e.order,
        memo: e.memo,
      })),
    };
  }

  get value(): CreateMyRankingResultType {
    return this._value;
  }
}
