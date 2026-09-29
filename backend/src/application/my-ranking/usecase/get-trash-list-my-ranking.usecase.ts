import { IGetTrashListMyRankingRepository, TrashMyRankingQueryType } from "../../../domain";
import { UserId } from "../../../domain/shared";
import { GetTrashListMyRankingResultDto } from "../dto";

/**
 * ゴミ箱のランキング一覧取得ユースケース
 */
export class GetTrashListMyRankingUsecase {

  // 1ページあたりの最大取得件数
  static readonly PAGE_SIZE = 30;

  constructor(private readonly repository: IGetTrashListMyRankingRepository) { }

  /**
   * 削除済み一覧取得（ページング・絞り込み対応）
   * @param userId ランキングを所有するユーザーID
   * @param query 絞り込み・並び順・ページ番号の条件
   * @returns 指定ページの削除済みランキング一覧・全件数・総ページ数
   */
  async execute(userId: UserId, query: TrashMyRankingQueryType): Promise<GetTrashListMyRankingResultDto> {
    const [list, total] = await Promise.all([
      this.repository.findAll(userId, query, GetTrashListMyRankingUsecase.PAGE_SIZE),
      this.repository.count(userId, query),
    ]);
    const totalPages = Math.ceil(total / GetTrashListMyRankingUsecase.PAGE_SIZE);
    return new GetTrashListMyRankingResultDto(list, total, totalPages);
  }
}
