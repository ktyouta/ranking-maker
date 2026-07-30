import { IGetListRankingRepository, RankingListType } from "../repository/get-list-ranking.repository.interface";

/**
 * ランキング一覧取得サービス
 */
export class GetListRankingService {
  constructor(private readonly repository: IGetListRankingRepository) { }

  /**
   * 全件取得
   */
  async findAll(): Promise<RankingListType[]> {
    return await this.repository.findAll();
  }
}
