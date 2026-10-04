import { IGetFilterTagsRepository } from "../../../../domain";
import { UserId } from "../../../../domain/shared";
import { GetFilterTagsResultDto } from "../../dto";

/**
 * ランキング一覧の絞り込み候補タグ取得ユースケース
 */
export class GetFilterTagsUsecase {
  constructor(private readonly repository: IGetFilterTagsRepository) { }

  /**
   * ゴミ箱に入っていないランキングに付いているタグ一覧を取得する
   * @param userId タグを所有するユーザーID
   * @returns タグ一覧
   */
  async execute(userId: UserId): Promise<GetFilterTagsResultDto> {
    const tags = await this.repository.findTags(userId);
    return new GetFilterTagsResultDto(tags);
  }
}
