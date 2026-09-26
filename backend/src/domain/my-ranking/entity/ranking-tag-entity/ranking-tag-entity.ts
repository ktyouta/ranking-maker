import { RankingTagId, TagId } from "../../value-object";

/**
 * ランキングタグエンティティ（ランキングへのタグ付け）
 */
export class RankingTagEntity {

  constructor(private readonly _rankingTagId: RankingTagId,
    private readonly _tagId: TagId,
    private _deleteFlg: boolean,
  ) { }

  get id() {
    return this._rankingTagId.value;
  }

  get tagId() {
    return this._tagId.value;
  }

  get deleteFlg() {
    return this._deleteFlg;
  }

  delete() {
    this._deleteFlg = true;
  }

  restore() {
    this._deleteFlg = false;
  }
}
