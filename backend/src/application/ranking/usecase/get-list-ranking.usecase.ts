import type { IGetListRankingRepository } from "../../../domain/ranking";
import { GetListRankingResultDto } from "../dto";

/**
 * ランキング一覧取得ユースケース
 */
export class GetListRankingUsecase {
  constructor(private readonly repository: IGetListRankingRepository) { }

  /**
   * 全件取得
   */
  async execute(): Promise<GetListRankingResultDto> {
    const list = await this.repository.findAll();
    return new GetListRankingResultDto(list);
  }
}
