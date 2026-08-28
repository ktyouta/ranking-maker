import { RankingId } from "../../shared";

export type RankingType = {
  id: string;
  title: string;
  userName: string;
  createdAt: string;
};

export type RankingOrderType = {
  id: string;
  itemName: string | null;
  itemMemo: string | null;
  createdAt: string;
};

/**
 * ランキング取得リポジトリインターフェース
 */
export interface IGetRankingRepository {
  /**
   * 公開ランキングマスタ取得
   * @param rankingId ランキングID
   * @returns 公開かつ未削除のランキング。存在しない場合は null
   */
  findRanking(rankingId: RankingId): Promise<RankingType | null>;

  /**
   * ランキングオーダー取得
   * @param rankingId 
   */
  findRankingOrder(rankingId: RankingId): Promise<RankingOrderType[]>;
}
