import type { IconMasterRecord } from "../../../domain";

export type GetIconsResultType = {
  id: number;
  emoji: string;
}[];

/**
 * アイコン一覧取得結果 DTO
 */
export class GetIconsResultDto {
  private readonly _value: GetIconsResultType;

  /**
   * @param icons 選択可能なアイコン一覧
   */
  constructor(icons: IconMasterRecord[]) {
    this._value = icons.map((e) => ({
      id: e.id,
      emoji: e.emoji,
    }));
  }

  get value(): GetIconsResultType {
    return this._value;
  }
}
