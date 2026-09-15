import { UserId } from "../../user";
import { RankingId } from "../../shared";

export type MyRankingExportType = {
  id: string;
  title: string;
};

export type MyRankingExportOrderType = {
  rankingId: string;
  itemName: string | null;
  itemMemo: string | null;
  order: number;
};

/**
 * ランキングCSVエクスポート用データ取得リポジトリインターフェース
 */
export interface IGetMyRankingExportRepository {
  /**
   * ランキングマスタ取得（所有権フィルタ済み）
   */
  findRankings(userId: UserId, rankingIds: RankingId[]): Promise<MyRankingExportType[]>;

  /**
   * ランキングオーダー取得（所有権フィルタ済みのランキングID一覧を渡すこと）
   */
  findRankingOrders(rankingIds: RankingId[]): Promise<MyRankingExportOrderType[]>;
}
