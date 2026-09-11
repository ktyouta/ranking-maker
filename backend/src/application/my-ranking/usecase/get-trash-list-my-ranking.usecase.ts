import { IGetTrashListMyRankingRepository, TrashMyRankingListType, TrashMyRankingQueryType } from "../../../domain";
import { UserId } from "../../../domain/user";

export type TrashMyRankingListResult = {
  list: TrashMyRankingListType[];
  total: number;
};

/**
 * ゴミ箱のランキング一覧取得ユースケース
 */
export class GetTrashListMyRankingUsecase {
  constructor(private readonly repository: IGetTrashListMyRankingRepository) { }

  /**
   * 削除済み一覧取得（ページング・絞り込み対応）
   */
  async execute(userId: UserId, query: TrashMyRankingQueryType): Promise<TrashMyRankingListResult> {
    const [list, total] = await Promise.all([
      this.repository.findAll(userId, query),
      this.repository.count(userId, query),
    ]);
    return { list, total };
  }
}
