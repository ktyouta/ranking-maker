import type { TagMasterRecord } from "../../../../domain";

export type GetTrashFilterTagsResultType = {
  name: string;
}[];

/**
 * ゴミ箱一覧の絞り込み候補タグ取得結果 DTO
 */
export class GetTrashFilterTagsResultDto {
  private readonly _value: GetTrashFilterTagsResultType;

  /**
   * @param tags ゴミ箱のランキングに付いているタグ一覧
   */
  constructor(tags: TagMasterRecord[]) {
    this._value = tags.map((e) => ({
      name: e.name,
    }));
  }

  get value(): GetTrashFilterTagsResultType {
    return this._value;
  }
}
