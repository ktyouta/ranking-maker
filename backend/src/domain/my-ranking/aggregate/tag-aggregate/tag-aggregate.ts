import { UserId } from "../../../shared";
import { TagId, TagName } from "../../value-object";

/**
 * タグ集約の生成に渡すパラメータ
 */
type TagAggregateCreateParams = {
  userId: UserId;
  tagName: TagName;
};

/**
 * タグ集約の再構築に渡すパラメータ
 */
type TagAggregateReconstructParams = TagAggregateCreateParams & {
  tagId: TagId;
};

type TagSnapshot = {
  id: string;
  userId: string;
  name: string;
};

/**
 * タグ集約
 */
export class TagAggregate {

  private constructor(private readonly _tagId: TagId,
    private readonly _userId: UserId,
    private readonly _tagName: TagName,
  ) { }

  /**
   * タグ集約を新規作成する
   * @param params 集約の構成要素
   * @returns 新しいタグIDを採番した集約
   */
  static create(params: TagAggregateCreateParams): TagAggregate {
    return new TagAggregate(
      TagId.generate(),
      params.userId,
      params.tagName,
    );
  }

  /**
   * 永続化データから集約を再構築する（リポジトリ・ドメインサービス専用）。
   * @param params 集約の構成要素
   * @returns 再構築した集約
   */
  static reconstruct(params: TagAggregateReconstructParams): TagAggregate {
    return new TagAggregate(
      params.tagId,
      params.userId,
      params.tagName,
    );
  }

  get id() {
    return this._tagId.value;
  }

  get userId() {
    return this._userId.value;
  }

  get name() {
    return this._tagName.value;
  }

  /**
   * スナップショット作成
   * @returns
   */
  toSnapshot(): TagSnapshot {
    return {
      id: this._tagId.value,
      userId: this._userId.value,
      name: this._tagName.value,
    };
  }
}
