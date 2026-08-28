import { IGetMyRankingRepository, RankingId, MyRankingOrderType, MyRankingType } from "../../../domain";
import { UserId } from "../../../domain/user";

type ReturnType = {
  ranking: MyRankingType;
  rankingOrder: MyRankingOrderType[];
}

/**
 * ランキング取得ユースケース
 */
export class GetMyRankingUsecase {
  constructor(private readonly repository: IGetMyRankingRepository) { }

  /**
   * ランキング取得
   */
  async execute(userId: UserId, rankingId: RankingId): Promise<ReturnType | null> {

    // ランキング
    const ranking = await this.repository.findRanking(userId, rankingId);

    if (!ranking) {
      return null;
    }

    // ランキングオーダー
    const rankingOrder = await this.repository.findRankingOrder(rankingId);

    return {
      ranking,
      rankingOrder,
    }
  }
}
