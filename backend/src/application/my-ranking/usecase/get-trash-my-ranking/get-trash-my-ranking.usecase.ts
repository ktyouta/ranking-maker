import { type IGetTrashMyRankingRepository, RankingId } from "../../../../domain";
import { UserId } from "../../../../domain/shared";
import { GetTrashMyRankingResultDto } from "../../dto";

type PropsType = {
  userId: UserId;
  rankingId: string;
}

/**
 * ゴミ箱のランキング取得ユースケース
 */
export class GetTrashMyRankingUsecase {
  constructor(private readonly repository: IGetTrashMyRankingRepository) { }

  /**
   * ランキング取得（削除済みのみ）
   * @param userId ランキングを所有するユーザーID
   * @param rankingId 取得対象のランキングID
   * @returns ランキングと項目一覧・タグ一覧。存在しない場合は null
   * @throws rankingId が空の場合（DB は問い合わせない）
   */
  async execute({ userId, rankingId }: PropsType): Promise<GetTrashMyRankingResultDto | null> {
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

    return new GetTrashMyRankingResultDto(ranking, rankingOrder, rankingTag);
  }
}
