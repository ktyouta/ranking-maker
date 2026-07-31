import type { IGetListRankingRepository, RankingListType } from "../../../domain/ranking";

/**
 * ランキング一覧取得ユースケース
 */
export class GetListRankingUsecase {
  constructor(private readonly repository: IGetListRankingRepository) { }

  /**
   * 全件取得
   */
  async execute(): Promise<RankingListType[]> {
    return await this.repository.findAll();
  }
}
