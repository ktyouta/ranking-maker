import { UserId } from "../../user";
import { RankingId } from "../../shared";
import { MyRankingOrderType, MyRankingType } from "./get-my-ranking.repository.interface";

/**
 * ゴミ箱のランキング取得リポジトリインターフェース
 */
export interface IGetTrashMyRankingRepository {
  /**
   * ランキングマスタ取得（削除済みのみ）
   */
  findRanking(userId: UserId, rankingId: RankingId): Promise<MyRankingType | null>;

  /**
   * ランキングオーダー取得（削除済みのみ）
   * @param rankingId
   */
  findRankingOrder(rankingId: RankingId): Promise<MyRankingOrderType[]>;
}
