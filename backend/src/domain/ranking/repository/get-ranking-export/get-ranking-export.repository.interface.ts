import { RankingId, UserId } from "../../../shared";

export type RankingExportType = {
  id: string;
  title: string;
};

export type RankingExportOrderType = {
  rankingId: string;
  itemName: string | null;
  itemMemo: string | null;
  order: number;
};

/**
 * ランキングCSVエクスポート用データ取得リポジトリインターフェース
 */
export interface IGetRankingExportRepository {
  /**
   * ランキングマスタ取得（所有権フィルタ済み）
   */
  findRankings(userId: UserId, rankingIds: RankingId[]): Promise<RankingExportType[]>;

  /**
   * ランキングオーダー取得（所有権フィルタ済みのランキングID一覧を渡すこと）
   */
  findRankingOrders(rankingIds: RankingId[]): Promise<RankingExportOrderType[]>;
}
