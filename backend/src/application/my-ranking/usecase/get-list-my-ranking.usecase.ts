import { IGetListMyRankingRepository, MyRankingQueryType } from "../../../domain";
import { UserId } from "../../../domain/shared";
import { GetListMyRankingResultDto } from "../dto";

/**
 * ランキング一覧取得ユースケース
 */
export class GetListMyRankingUsecase {
  constructor(private readonly repository: IGetListMyRankingRepository) { }

  /**
   * 一覧取得（ページング・絞り込み対応）
   */
  async execute(userId: UserId, query: MyRankingQueryType): Promise<GetListMyRankingResultDto> {
    const [list, total] = await Promise.all([
      this.repository.findAll(userId, query),
      this.repository.count(userId, query),
    ]);
    return new GetListMyRankingResultDto(list, total);
  }
}
