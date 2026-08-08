import { IGetListMyRankingRepository, MyRankingListType } from "../../../domain/my-ranking/repository";
import { UserId } from "../../../domain/user";

/**
 * ランキング一覧取得ユースケース
 */
export class GetListMyRankingUsecase {
  constructor(private readonly repository: IGetListMyRankingRepository) { }

  /**
   * 全件取得
   */
  async execute(userId: UserId): Promise<MyRankingListType[]> {
    return await this.repository.findAll(userId);
  }
}
