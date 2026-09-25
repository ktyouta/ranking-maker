import { IGetIconsRepository } from "../../../domain";
import { GetIconsResultDto } from "../dto";

/**
 * アイコン一覧取得ユースケース
 */
export class GetIconsUsecase {
  constructor(private readonly repository: IGetIconsRepository) { }

  /**
   * 選択可能なアイコン一覧を取得する
   */
  async execute(): Promise<GetIconsResultDto> {
    const icons = await this.repository.findIcons();
    return new GetIconsResultDto(icons);
  }
}
