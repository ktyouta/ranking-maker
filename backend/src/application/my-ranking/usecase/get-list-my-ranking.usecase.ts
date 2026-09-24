import { IGetListMyRankingRepository, MyRankingListType, MyRankingQueryType } from "../../../domain";
import { UserId } from "../../../domain/shared";

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
  async execute(userId: UserId, query: MyRankingQueryType): Promise<MyRankingListResult> {
    const [list, total] = await Promise.all([
      this.repository.findAll(userId, query),
      this.repository.count(userId, query),
    ]);
    return { list, total };
  }
}
