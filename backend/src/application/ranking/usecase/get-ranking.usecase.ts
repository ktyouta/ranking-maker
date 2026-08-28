import type { IGetRankingRepository, RankingId, RankingOrderType, RankingType } from "../../../domain";

type ReturnType = {
  ranking: RankingType;
  rankingOrder: RankingOrderType[];
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
   */
  async execute(rankingId: RankingId): Promise<ReturnType | null> {
    // ランキング
    const ranking = await this.repository.findRanking(rankingId);

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
