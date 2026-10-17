import type { TagMasterRecord } from "../../../../domain";

export type GetFilterTagsResultType = {
  name: string;
}[];

/**
 * ランキング一覧の絞り込み候補タグ取得結果 DTO
 */
export class GetFilterTagsResultDto {
  private readonly _value: GetFilterTagsResultType;

  /**
   * @param tags ゴミ箱に入っていないランキングに付いているタグ一覧
   */
  constructor(tags: TagMasterRecord[]) {
    this._value = tags.map((e) => ({
      name: e.name,
    }));
  }

  get value(): GetFilterTagsResultType {
    return this._value;
  }
}
