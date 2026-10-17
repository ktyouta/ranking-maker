import { type IGetRankingRepository, RankingId } from "../../../../domain";
import { UserId } from "../../../../domain/shared";
import { GetRankingResultDto } from "../../dto";

type PropsType = {
  userId: UserId;
  rankingId: string;
}

/**
 * ランキング取得ユースケース
 */
export class GetRankingUsecase {
  constructor(private readonly repository: IGetRankingRepository) { }

  /**
   * ランキング取得
   * @param userId ランキングを所有するユーザーID
   * @param rankingId 取得対象のランキングID
   * @returns ランキングと項目一覧・タグ一覧。存在しない場合は null
   * @throws rankingId が空の場合（DB は問い合わせない）
   */
  async execute({ userId, rankingId }: PropsType): Promise<GetRankingResultDto | null> {
    const id = RankingId.of(rankingId);

    // ランキング
    const ranking = await this.repository.findRanking(userId, id);

    if (!ranking) {
      return null;
    }

    // ランキングオーダー
    const rankingOrder = await this.repository.findRankingOrder(id);

    // ランキングタグ
    const rankingTag = await this.repository.findRankingTag(userId, id);

    return new GetRankingResultDto(ranking, rankingOrder, rankingTag);
  }
}
