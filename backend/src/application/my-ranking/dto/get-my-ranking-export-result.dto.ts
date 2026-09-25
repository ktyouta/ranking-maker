import type { MyRankingExportOrderType, MyRankingExportType } from "../../../domain";

export type GetMyRankingExportResultType = {
  ranking: {
    id: string;
    title: string;
  };
  items: {
    itemName: string | null;
    itemMemo: string | null;
    order: number;
  }[];
}[];

/**
 * ランキングCSVエクスポート用データ取得結果 DTO
 */
export class GetMyRankingExportResultDto {
  private readonly _value: GetMyRankingExportResultType;

  /**
   * @param rankings 所有権フィルタ済みのランキング一覧
   * @param orders rankings に含まれるランキングのオーダー一覧
   */
  constructor(rankings: MyRankingExportType[], orders: MyRankingExportOrderType[]) {
    this._value = rankings.map((ranking) => ({
      ranking: {
        id: ranking.id,
        title: ranking.title,
      },
      items: orders
        .filter((order) => order.rankingId === ranking.id)
        .map((order) => ({ itemName: order.itemName, itemMemo: order.itemMemo, order: order.order })),
    }));
  }

  get value(): GetMyRankingExportResultType {
    return this._value;
  }
}
