import { IGetTagsRepository } from "../../../../domain";
import { UserId } from "../../../../domain/shared";
import { GetTagsResultDto } from "../../dto";

/**
 * タグ一覧取得ユースケース
 */
export class GetTagsUsecase {
  constructor(private readonly repository: IGetTagsRepository) { }

  /**
   * ユーザーが所有するタグ一覧を取得する
   * @param userId タグを所有するユーザーID
   * @returns タグ一覧
   */
  async execute(userId: UserId): Promise<GetTagsResultDto> {
    const tags = await this.repository.findTags(userId);
    return new GetTagsResultDto(tags);
  }
}
