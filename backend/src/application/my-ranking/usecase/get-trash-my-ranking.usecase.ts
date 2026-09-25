import { IGetTrashMyRankingRepository, RankingId } from "../../../domain";
import { UserId } from "../../../domain/shared";
import { GetTrashMyRankingResultDto } from "../dto";

/**
 * ゴミ箱のランキング取得ユースケース
 */
export class GetTrashMyRankingUsecase {
  constructor(private readonly repository: IGetTrashMyRankingRepository) { }

  /**
   * ランキング取得（削除済みのみ）
   */
  async execute(userId: UserId, rankingId: RankingId): Promise<GetTrashMyRankingResultDto | null> {

    // ランキング
    const ranking = await this.repository.findRanking(userId, rankingId);

    if (!ranking) {
      return null;
    }

    // ランキングオーダー
    const rankingOrder = await this.repository.findRankingOrder(rankingId);

    return new GetTrashMyRankingResultDto(ranking, rankingOrder);
  }
}
