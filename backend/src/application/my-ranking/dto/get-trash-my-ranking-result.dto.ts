import type { TrashMyRankingOrderType, TrashMyRankingTagType, TrashMyRankingType } from "../../../domain";

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
 * ゴミ箱のランキング取得結果 DTO
 */
export class GetTrashMyRankingResultDto {
  private readonly _value: GetTrashMyRankingResultType;

  /**
   * @param ranking 削除済みランキング
   * @param rankingOrder 削除済みランキングのオーダー一覧
   * @param rankingTag 削除済みランキングのタグ一覧
   */
  constructor(ranking: TrashMyRankingType, rankingOrder: TrashMyRankingOrderType[], rankingTag: TrashMyRankingTagType[]) {
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
      items: rankingOrder.map((e) => ({
        id: e.id,
        itemName: e.itemName,
        itemMemo: e.itemMemo,
        order: e.order,
        createdAt: e.createdAt,
      })),
      tags: rankingTag.map((e) => ({
        name: e.name,
      })),
    };
  }

  get value(): GetTrashMyRankingResultType {
    return this._value;
  }
}
