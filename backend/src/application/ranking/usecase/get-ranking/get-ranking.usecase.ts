import { type IGetRankingRepository, RankingId } from "../../../../domain";
import { GetRankingResultDto } from "../../dto";

type PropsType = {
  rankingId: string;
}

/**
 * ランキング取得ユースケース
 */
export class GetRankingUsecase {
  constructor(private readonly repository: IGetRankingRepository) { }

  /**
   * 公開ランキングを項目一覧付きで1件取得する
   * @param rankingId ランキングID
   * @returns ランキングと項目一覧。存在しない場合は null
   * @throws rankingId が空の場合（DB は問い合わせない）
   */
  async execute({ rankingId }: PropsType): Promise<GetRankingResultDto | null> {
    const id = RankingId.of(rankingId);

    // ランキング
    const ranking = await this.repository.findRanking(id);

    if (!ranking) {
      return null;
    }

    // ランキングオーダー
    const rankingOrder = await this.repository.findRankingOrder(id);

    return new GetRankingResultDto(ranking, rankingOrder);
  }
}
