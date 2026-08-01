import { IGetListMyRankingRepository } from "../../../domain/my-ranking/repository";
import type { RankingListType } from "../../../domain/ranking";
import { UserId } from "../../../domain/user";

/**
 * ランキング一覧取得ユースケース
 */
export class GetListMyRankingUsecase {
  constructor(private readonly repository: IGetListMyRankingRepository) { }

  /**
   * 全件取得
   */
  async execute(userId: UserId): Promise<RankingListType[]> {
    return await this.repository.findAll(userId);
  }
}
