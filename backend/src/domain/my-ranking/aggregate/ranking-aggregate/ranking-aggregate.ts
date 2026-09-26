import { err, ok, Result } from "neverthrow";
import { RankingId, UserId } from "../../../shared";
import { RankingOrderEntity, RankingTagEntity } from "../../entity";
import { PublicStatus, RankingIcon, RankingMemo, RankingTitle, TagId } from "../../value-object";

/**
 * ランキング集約の生成・再構築に渡すパラメータ
 */
type RankingAggregateParams = {
  rankingId: RankingId;
  rankingTitle: RankingTitle;
  publicStatus: PublicStatus;
  icon: RankingIcon;
  memo: RankingMemo;
  userId: UserId;
  rankingOrderEntityList: RankingOrderEntity[];
  rankingTagEntityList: RankingTagEntity[];
};

type RankingAggregateReconstructParams = RankingAggregateParams & {
  isDeleted: boolean;
  isFavorite: boolean;
};

/**
 * ランキング集約の更新に渡すパラメータ（識別子・所有者は既存の集約から引き継ぐ）
 */
type RankingAggregateUpdateParams = Omit<RankingAggregateParams, "rankingId" | "userId">;

/**
 * ランキング更新の結果
 */
type RankingUpdateResult = {
  ranking: RankingAggregate;
  releasedTagIds: TagId[];
};

/**
 * ランキングの不変条件の違反（作成・更新共通）
 */
export type RankingValidationError =
  | { type: "DUPLICATE_ITEM_NAME"; itemName: string }
  | { type: "DUPLICATE_ORDER"; order: number }
  | { type: "DUPLICATE_TAG"; tagId: string }
  | { type: "TOO_MANY_TAGS"; maxCount: number };

/**
 * ランキング削除時のエラー
 */
export type RankingDeleteError = { type: "IS_FAVORITE" };

type RankingSnapshot = {
  id: string;
  title: string;
  memo: string | null;
  publicStatus: number;
  icon: number;
  userId: string;
  rankingOrderList: {
    id: string;
    itemName: string | null;
    memo: string | null;
    order: number;
    deleteFlg: boolean;
  }[];
  deleteFlg: boolean;
  isFavorite: boolean;
  rankingTagList: {
    id: string;
    tagId: string;
    deleteFlg: boolean;
  }[];
};

/**
 * ランキング集約
 */
export class RankingAggregate {
  static readonly MAX_TAG_COUNT = 20;

  private constructor(private readonly _rankingId: RankingId,
    private readonly _rankingTitle: RankingTitle,
    private readonly _publicStatus: PublicStatus,
    private readonly _icon: RankingIcon,
    private readonly _memo: RankingMemo,
    private readonly _userId: UserId,
    private readonly _rankingOrderEntityList: RankingOrderEntity[],
    private _deleteFlg: boolean,
    private _isFavorite: boolean,
    private readonly _rankingTagEntityList: RankingTagEntity[],
  ) { }

  /**
   * ランキング集約を生成する（新規作成の入口）。
   *
   * 集約の不変条件（順位・名称・タグの重複禁止、タグ数の上限）を検証し、違反があれば
   * すべて収集して err で返す。各項目の単一フィールド検証は
   * 値オブジェクトが担うため、ここでは集約横断の一意性のみを検証する。
   * @param params 集約の構成要素
   * @returns 検証成功時は集約、失敗時は違反一覧を持つ Result
   */
  static create(params: RankingAggregateParams): Result<RankingAggregate, RankingValidationError[]> {
    const errors = RankingAggregate.collectErrors(params.rankingOrderEntityList, params.rankingTagEntityList);

    if (errors.length > 0) {
      return err(errors);
    }

    return ok(
      new RankingAggregate(
        params.rankingId,
        params.rankingTitle,
        params.publicStatus,
        params.icon,
        params.memo,
        params.userId,
        params.rankingOrderEntityList,
        false,
        false,
        params.rankingTagEntityList,
      ),
    );
  }

  /**
   * 永続化データから集約を再構築する（リポジトリ専用）。
   *
   * DB のデータは検証済みとみなし、不変条件の検証は行わない。
   * @param params 集約の構成要素
   * @returns 再構築した集約
   */
  static reconstruct(params: RankingAggregateReconstructParams): RankingAggregate {
    return new RankingAggregate(
      params.rankingId,
      params.rankingTitle,
      params.publicStatus,
      params.icon,
      params.memo,
      params.userId,
      params.rankingOrderEntityList,
      params.isDeleted,
      params.isFavorite,
      params.rankingTagEntityList,
    );
  }

  get id() {
    return this._rankingId.value;
  }

  get title() {
    return this._rankingTitle.value;
  }

  get publicStatus() {
    return this._publicStatus.value;
  }

  get icon() {
    return this._icon.value;
  }

  get memo() {
    return this._memo.value;
  }

  get userId() {
    return this._userId.value;
  }

  get rankingOrderEntityList() {
    return [...this._rankingOrderEntityList];
  }

  get deleteFlg() {
    return this._deleteFlg;
  }

  get rankingTagEntityList() {
    return [...this._rankingTagEntityList];
  }

  /**
   * ランキングを更新する（全置換更新の入口）。
   *
   * 削除されていないランキングのみ対象とする。
   * 識別子・所有者・お気に入り状態は引き継ぎ、それ以外を指定内容で置き換えた集約を生成する。
   * 不変条件の検証は create と同じく、違反をすべて収集して err で返す。
   * @param params 更新後の構成要素
   * @returns 検証成功時は更新後の集約と手放したタグ、失敗時は違反一覧を持つ Result
   */
  update(params: RankingAggregateUpdateParams): Result<RankingUpdateResult, RankingValidationError[]> {
    if (this._deleteFlg) {
      throw new Error(`削除されたランキングです。`);
    }

    const errors = RankingAggregate.collectErrors(params.rankingOrderEntityList, params.rankingTagEntityList);

    if (errors.length > 0) {
      return err(errors);
    }

    const updatedTagIds = new Set(params.rankingTagEntityList.map((e) => e.tagId));

    return ok({
      ranking: new RankingAggregate(
        this._rankingId,
        params.rankingTitle,
        params.publicStatus,
        params.icon,
        params.memo,
        this._userId,
        params.rankingOrderEntityList,
        this._deleteFlg,
        this._isFavorite,
        params.rankingTagEntityList,
      ),
      releasedTagIds: this._rankingTagEntityList
        .filter((e) => !updatedTagIds.has(e.tagId))
        .map((e) => TagId.of(e.tagId)),
    });
  }

  /**
   * 集約の不変条件の違反をすべて収集する
   * @param items ランキング項目エンティティ一覧
   * @param rankingTags ランキングタグエンティティ一覧
   * @returns 違反一覧（違反がなければ空配列）
   */
  private static collectErrors(items: RankingOrderEntity[], rankingTags: RankingTagEntity[]): RankingValidationError[] {
    return [
      ...RankingAggregate.collectItemErrors(items),
      ...RankingAggregate.collectTagErrors(rankingTags),
    ];
  }

  /**
   * 集約横断の一意性違反をすべて収集する(項目)
   * @param items ランキング項目エンティティ一覧
   * @returns 違反一覧（違反がなければ空配列）
   */
  private static collectItemErrors(items: RankingOrderEntity[]): RankingValidationError[] {
    const errors: RankingValidationError[] = [];
    const itemNames = items.map((e) => e.itemName).filter((itemName): itemName is string => !!itemName);

    for (const itemName of RankingAggregate.findDuplicates(itemNames)) {
      errors.push({ type: "DUPLICATE_ITEM_NAME", itemName });
    }

    for (const order of RankingAggregate.findDuplicates(items.map((e) => e.order))) {
      errors.push({ type: "DUPLICATE_ORDER", order });
    }

    return errors;
  }

  /**
   * 集約横断の一意性違反をすべて収集する(タグ)
   * @param rankingTags ランキングタグエンティティ一覧
   * @returns 違反一覧（違反がなければ空配列）
   */
  private static collectTagErrors(rankingTags: RankingTagEntity[]): RankingValidationError[] {
    const errors: RankingValidationError[] = [];

    if (rankingTags.length > RankingAggregate.MAX_TAG_COUNT) {
      errors.push({ type: "TOO_MANY_TAGS", maxCount: RankingAggregate.MAX_TAG_COUNT });
    }

    for (const tagId of RankingAggregate.findDuplicates(rankingTags.map((e) => e.tagId))) {
      errors.push({ type: "DUPLICATE_TAG", tagId });
    }

    return errors;
  }

  /**
   * 重複している値を列挙する（重複値ごとに1件）
   * @param values 検査対象の値一覧
   * @returns 重複していた値の一覧
   */
  private static findDuplicates<V>(values: V[]): V[] {
    const seen = new Set<V>();
    const duplicated = new Set<V>();

    for (const value of values) {
      if (!!value && seen.has(value)) {
        duplicated.add(value);
      }
      else {
        seen.add(value);
      }
    }

    return [...duplicated];
  }

  /**
   * ランキング復元
   * 配下の項目・タグ付けもあわせて復元する
   */
  restore() {
    if (!this._deleteFlg) {
      throw new Error(`削除されていないランキングです。`);
    }
    this._deleteFlg = false;
    this._rankingOrderEntityList.forEach((order) => {
      order.restore();
    });
    this._rankingTagEntityList.forEach((rankingTag) => {
      rankingTag.restore();
    });
  }

  /**
   * スナップショット作成
   * @returns
   */
  toSnapshot(): RankingSnapshot {
    return {
      id: this._rankingId.value,
      title: this._rankingTitle.value,
      memo: this._memo.value,
      publicStatus: this._publicStatus.value,
      icon: this._icon.value,
      userId: this._userId.value,
      rankingOrderList: this._rankingOrderEntityList.map((e) => {
        return {
          id: e.id,
          itemName: e.itemName,
          memo: e.memo,
          order: e.order,
          deleteFlg: e.deleteFlg
        }
      }),
      deleteFlg: this._deleteFlg,
      isFavorite: this._isFavorite,
      rankingTagList: this._rankingTagEntityList.map((e) => {
        return {
          id: e.id,
          tagId: e.tagId,
          deleteFlg: e.deleteFlg,
        }
      }),
    };
  }

  /**
   * ランキングのお気に入り判定
   * @returns
   */
  isFavorite() {
    return this._isFavorite;
  }

  /**
   * ランキング削除判定
   * @returns
   */
  isDeleted() {
    return this._deleteFlg;
  }

  /**
   * ランキングを削除
   * 配下の項目・タグ付けもあわせて削除する
   * @returns 削除成功時は ok、お気に入り登録中で削除できない場合は IS_FAVORITE
   */
  delete(): Result<void, RankingDeleteError> {
    // お気に入り登録中のランキングは削除不可
    if (this.isFavorite()) {
      return err({ type: "IS_FAVORITE" });
    }
    this._deleteFlg = true;
    this._rankingOrderEntityList.forEach((order) => {
      order.delete();
    })
    this._rankingTagEntityList.forEach((rankingTag) => {
      rankingTag.delete();
    });
    return ok(undefined);
  }

  /**
   * 完全削除に伴い、付いていたタグをすべて手放す
   * ゴミ箱内（削除済み）のランキングのみ対象とする
   * @returns 手放したタグID一覧
   */
  releaseTagsOnPermanentDelete(): TagId[] {
    if (!this._deleteFlg) {
      throw new Error(`削除されていないランキングです。`);
    }
    return this._rankingTagEntityList.map((e) => TagId.of(e.tagId));
  }
}
