import { IGetTrashListMyRankingRepository, TrashMyRankingListType, TrashMyRankingQueryType } from "../../../domain";
import { UserId } from "../../../domain/user";
import { GetTrashListMyRankingQuerySchemaType } from "../../../presentation/my-ranking/schema";

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
  async execute(userId: UserId, query: GetTrashListMyRankingQuerySchemaType): Promise<TrashMyRankingListResult> {
    const trashQuery: TrashMyRankingQueryType = {
      title: query.title,
      createdAtFrom: query.createdAtFrom,
      createdAtTo: query.createdAtTo,
      updatedAtFrom: query.updatedAtFrom,
      updatedAtTo: query.updatedAtTo,
      page: query.page,
    };
    const [list, total] = await Promise.all([
      this.repository.findAll(userId, trashQuery),
      this.repository.count(userId, trashQuery),
    ]);
    return { list, total };
  }
}
