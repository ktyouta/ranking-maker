import { IconMasterRecord, IGetIconsRepository } from "../../../domain";

/**
 * アイコン一覧取得ユースケース
 */
export class GetIconsUsecase {
  constructor(private readonly repository: IGetIconsRepository) { }

  /**
   * 選択可能なアイコン一覧を取得する
   */
  async execute(): Promise<IconMasterRecord[]> {
    return this.repository.findIcons();
  }
}
