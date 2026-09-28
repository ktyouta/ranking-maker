import { IGetTrashFilterTagsRepository } from "../../../domain";
import { UserId } from "../../../domain/shared";
import { GetTrashFilterTagsResultDto } from "../dto";

/**
 * ゴミ箱一覧の絞り込み候補タグ取得ユースケース
 */
export class GetTrashFilterTagsUsecase {
  constructor(private readonly repository: IGetTrashFilterTagsRepository) { }

  /**
   * ゴミ箱のランキングに付いているタグ一覧を取得する
   * @param userId タグを所有するユーザーID
   * @returns タグ一覧
   */
  async execute(userId: UserId): Promise<GetTrashFilterTagsResultDto> {
    const tags = await this.repository.findTags(userId);
    return new GetTrashFilterTagsResultDto(tags);
  }
}
