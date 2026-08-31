import { IGetListMyRankingRepository, MyRankingListType, MyRankingQueryType } from "../../../domain";
import { UserId } from "../../../domain/user";
import { GetListMyRankingQuerySchemaType } from "../../../presentation/my-ranking/schema";

export type MyRankingListResult = {
  list: MyRankingListType[];
  total: number;
};

/**
 * ランキング一覧取得ユースケース
 */
export class GetListMyRankingUsecase {
  constructor(private readonly repository: IGetListMyRankingRepository) { }

  /**
   * 一覧取得（ページング・絞り込み対応）
   */
  async execute(userId: UserId, query: GetListMyRankingQuerySchemaType): Promise<MyRankingListResult> {
    const myRankingQuery: MyRankingQueryType = {
      title: query.title,
      createdAtFrom: query.createdAtFrom,
      createdAtTo: query.createdAtTo,
      updatedAtFrom: query.updatedAtFrom,
      updatedAtTo: query.updatedAtTo,
      page: query.page,
    };
    const [list, total] = await Promise.all([
      this.repository.findAll(userId, myRankingQuery),
      this.repository.count(userId, myRankingQuery),
    ]);
    return { list, total };
  }
}
