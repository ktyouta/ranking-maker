import { RankingAggregate } from "../../shared";
import { RankingId } from "../../shared/value-object/ranking-id";
import { UserId } from "../../user";


/**
 * ランキング更新リポジトリインターフェース
 */
export interface IUpdateMyRankingRepository {
  /**
   * ランキングマスタ取得（更新対象の存在・所有権チェック用）
   */
  findRanking(userId: UserId, rankingId: RankingId): Promise<{ id: string }[]>;

  /**
   * ランキング更新
   * @param rankingAggregate 更新後の状態を表す集約
   */
  updateRanking(rankingAggregate: RankingAggregate): Promise<void>;
}
