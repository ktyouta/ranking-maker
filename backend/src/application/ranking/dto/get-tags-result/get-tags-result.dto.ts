import type { TagMasterRecord } from "../../../../domain";

export type GetTagsResultType = {
  name: string;
}[];

/**
 * タグ一覧取得結果 DTO
 */
export class GetTagsResultDto {
  private readonly _value: GetTagsResultType;

  /**
   * @param tags ユーザーが所有するタグ一覧
   */
  constructor(tags: TagMasterRecord[]) {
    this._value = tags.map((e) => ({
      name: e.name,
    }));
  }

  get value(): GetTagsResultType {
    return this._value;
  }
}
