import { IGetMyRankingRepository, RankingOrderType, RankingType } from "../../../domain/my-ranking/repository";
import { RankingId } from "../../../domain/shared/value-object/ranking-id";
import { UserId } from "../../../domain/user";

type ReturnType = {
  ranking: RankingType;
  rankingOrder: RankingOrderType[];
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
