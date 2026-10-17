import { RankingId, UserId } from "../../../shared";

export type RankingType = {
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

export type RankingOrderType = {
  id: string;
  itemName: string | null;
  itemMemo: string | null;
  order: number;
  createdAt: string;
};

export type RankingTagType = {
  name: string;
};

/**
 * ランキング取得リポジトリインターフェース
 */
export interface IGetRankingRepository {
  /**
   * ランキングマスタ取得
   */
  findRanking(userId: UserId, rankingId: RankingId): Promise<RankingType | null>;

  /**
   * ランキングオーダー取得
   * @param rankingId 
   */
  findRankingOrder(rankingId: RankingId): Promise<RankingOrderType[]>;

  /**
   * ランキングタグ取得
   * @param userId
   * @param rankingId
   */
  findRankingTag(userId: UserId, rankingId: RankingId): Promise<RankingTagType[]>;
}
