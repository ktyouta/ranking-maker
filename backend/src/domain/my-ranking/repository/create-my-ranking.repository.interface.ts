import { RankingTitle } from "../../shared";
import { RankingAggregate } from "../../shared/aggregate/ranking-aggregate";
import { UserId } from "../../user";

type RankingType = {
  id: string;
};


/**
 * ランキング作成リポジトリインターフェース
 */
export interface ICreateMyRankingRepository {
  /**
   * ランキングマスタ取得
   */
  findRanking(userId: UserId, rankingTitle: RankingTitle): Promise<RankingType[]>;

  /**
   * ランキング作成
   * @param rankingAggregate 
   */
  createRanking(rankingAggregate: RankingAggregate): Promise<void>;
}
