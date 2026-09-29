import { IGetListMyRankingRepository, MyRankingQueryType } from "../../../domain";
import { UserId } from "../../../domain/shared";
import { GetListMyRankingResultDto } from "../dto";

/**
 * ランキング一覧取得ユースケース
 */
export class GetListMyRankingUsecase {

  // 1ページあたりの最大取得件数
  static readonly PAGE_SIZE = 30;

  constructor(private readonly repository: IGetListMyRankingRepository) { }

  /**
   * 一覧取得（ページング・絞り込み対応）
   * @param userId ランキングを所有するユーザーID
   * @param query 絞り込み・並び順・ページ番号の条件
   * @returns 指定ページのランキング一覧・全件数・総ページ数
   */
  async execute(userId: UserId, query: MyRankingQueryType): Promise<GetListMyRankingResultDto> {
    const [list, total] = await Promise.all([
      this.repository.findAll(userId, query, GetListMyRankingUsecase.PAGE_SIZE),
      this.repository.count(userId, query),
    ]);
    const totalPages = Math.ceil(total / GetListMyRankingUsecase.PAGE_SIZE);
    return new GetListMyRankingResultDto(list, total, totalPages);
  }
}
