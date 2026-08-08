import { RankingOrderType, RankingType } from "../../../domain/my-ranking/repository";
import { ICreateMyRankingRepository } from "../../../domain/my-ranking/repository/create-my-ranking.repository.interface";
import { RankingId } from "../../../domain/shared/value-object/ranking-id";
import { UserId } from "../../../domain/user";

type ReturnType = {
  ranking: RankingType;
  rankingOrder: RankingOrderType[];
}

/**
 * ランキング作成ユースケース
 */
export class CreateMyRankingUsecase {
  constructor(private readonly repository: ICreateMyRankingRepository) { }

  /**
   * ランキング作成
   */
  async execute(userId: UserId, rankingId: RankingId): Promise<ReturnType | null> {

    // ランキング
    const ranking = await this.repository.findRanking(userId, rankingId);

    if (!ranking) {
      return null;
    }


    // ランキング作成
    //const rankingOrder = await this.repository.createRanking(rankingId);

    return {
      ranking,
      rankingOrder: [],
    }
  }
}
