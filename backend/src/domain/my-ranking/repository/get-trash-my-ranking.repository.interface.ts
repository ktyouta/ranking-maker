import { RankingId, UserId } from "../../shared";

export type TrashMyRankingType = {
  id: string;
  title: string;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
  publicStatus: number;
  publicStatusName: string;
  icon: number;
};

export type TrashMyRankingOrderType = {
  id: string;
  itemName: string | null;
  itemMemo: string | null;
  order: number;
  createdAt: string;
};

/**
 * ゴミ箱のランキング取得リポジトリインターフェース
 */
export interface IGetTrashMyRankingRepository {
  /**
   * ランキングマスタ取得（削除済みのみ）
   */
  findRanking(userId: UserId, rankingId: RankingId): Promise<TrashMyRankingType | null>;

  /**
   * ランキングオーダー取得（削除済みのみ）
   * @param rankingId
   */
  findRankingOrder(rankingId: RankingId): Promise<TrashMyRankingOrderType[]>;
}
