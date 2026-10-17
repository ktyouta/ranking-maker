import { RankingId, UserId } from "../../../shared";

export type TrashRankingType = {
  id: string;
  title: string;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
  publicStatus: number;
  publicStatusName: string;
  icon: number;
};

export type TrashRankingOrderType = {
  id: string;
  itemName: string | null;
  itemMemo: string | null;
  order: number;
  createdAt: string;
};

export type TrashRankingTagType = {
  name: string;
};

/**
 * ゴミ箱のランキング取得リポジトリインターフェース
 */
export interface IGetTrashRankingRepository {
  /**
   * ランキングマスタ取得（削除済みのみ）
   */
  findRanking(userId: UserId, rankingId: RankingId): Promise<TrashRankingType | null>;

  /**
   * ランキングオーダー取得（削除済みのみ）
   * @param rankingId
   */
  findRankingOrder(rankingId: RankingId): Promise<TrashRankingOrderType[]>;

  /**
   * ランキングタグ取得（削除済みのみ）
   * @param userId
   * @param rankingId
   */
  findRankingTag(userId: UserId, rankingId: RankingId): Promise<TrashRankingTagType[]>;
}
