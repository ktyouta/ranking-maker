import { IGetMyRankingRepository, RankingId } from "../../../domain";
import { UserId } from "../../../domain/shared";
import { GetMyRankingResultDto } from "../dto";

/**
 * ランキング取得ユースケース
 */
export class GetMyRankingUsecase {
  constructor(private readonly repository: IGetMyRankingRepository) { }

  /**
   * ランキング取得
   */
  async execute(userId: UserId, rankingId: RankingId): Promise<GetMyRankingResultDto | null> {

    // ランキング
    const ranking = await this.repository.findRanking(userId, rankingId);

    if (!ranking) {
      return null;
    }

    // ランキングオーダー
    const rankingOrder = await this.repository.findRankingOrder(rankingId);

    return new GetMyRankingResultDto(ranking, rankingOrder);
  }
}
