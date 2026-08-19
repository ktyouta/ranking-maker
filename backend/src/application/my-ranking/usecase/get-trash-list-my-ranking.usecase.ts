import { IGetTrashListMyRankingRepository, TrashMyRankingListType } from "../../../domain";
import { UserId } from "../../../domain/user";

/**
 * ゴミ箱のランキング一覧取得ユースケース
 */
export class GetTrashListMyRankingUsecase {
  constructor(private readonly repository: IGetTrashListMyRankingRepository) { }

  /**
   * 削除済み全件取得
   */
  async execute(userId: UserId): Promise<TrashMyRankingListType[]> {
    return await this.repository.findAll(userId);
  }
}
