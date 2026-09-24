import { err, ok, Result } from "neverthrow";
import { RankingId, UserId } from "../../../shared";
import { RankingOrderEntity } from "../../entity";
import { PublicStatus, RankingIcon, RankingMemo, RankingTitle } from "../../value-object";

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
};

type RankingAggregateReconstructParams = RankingAggregateParams & {
  isDeleted: boolean;
  isFavorite: boolean;
};

/**
 * 不適切内容チェックの判定対象
 */
export type ContentModerationTarget =
  | { type: "TITLE"; value: string }
  | { type: "MEMO"; value: string }
  | { type: "ITEM_NAME"; itemIndex: number; value: string }
  | { type: "ITEM_MEMO"; itemIndex: number; value: string };

/**
 * ランキング生成時のエラー
 */
export type RankingCreateError =
  | { type: "DUPLICATE_ITEM_NAME"; itemName: string }
  | { type: "DUPLICATE_ORDER"; order: number };

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
  rankingOrderEntityList: {
    id: string;
    itemName: string | null;
    memo: string | null;
    order: number;
  }[];
  deleteFlg: boolean;
  isFavorite: boolean;
};

/**
 * ランキング集約
 */
export class RankingAggregate {

  private constructor(private readonly _rankingId: RankingId,
    private readonly _rankingTitle: RankingTitle,
    private readonly _publicStatus: PublicStatus,
    private readonly _icon: RankingIcon,
    private readonly _memo: RankingMemo,
    private readonly _userId: UserId,
    private readonly _rankingOrderEntityList: RankingOrderEntity[],
    private _deleteFlg: boolean,
    private _isFavorite: boolean,
  ) { }

  /**
   * ランキング集約を生成する（新規作成・全置換更新の入口）。
   *
   * 集約の不変条件（順位・名称の重複禁止）を検証し、違反があれば
   * すべて収集して err で返す。各項目の単一フィールド検証は
   * 値オブジェクトが担うため、ここでは集約横断の一意性のみを検証する。
   * @param params 集約の構成要素
   * @returns 検証成功時は集約、失敗時は違反一覧を持つ Result
   */
  static create(params: RankingAggregateParams): Result<RankingAggregate, RankingCreateError[]> {
    const errors = RankingAggregate.collectItemErrors(params.rankingOrderEntityList);

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

  /**
   * 集約横断の一意性違反をすべて収集する
   * @param items ランキング項目エンティティ一覧
   * @returns 違反一覧（違反がなければ空配列）
   */
  private static collectItemErrors(items: RankingOrderEntity[]): RankingCreateError[] {
    const errors: RankingCreateError[] = [];
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
   * 配下の項目もあわせて復元する
   */
  restore() {
    if (!this._deleteFlg) {
      throw new Error(`削除されていないランキングです。`);
    }
    this._deleteFlg = false;
    this._rankingOrderEntityList.forEach((order) => {
      order.restore();
    });
  }

  /**
   * 不適切内容チェックの判定対象一覧を作成する
   * @returns ユーザーが自由入力するフィールドの一覧
   */
  toModerationTargets(): ContentModerationTarget[] {
    const targets: ContentModerationTarget[] = [
      { type: "TITLE", value: this._rankingTitle.value },
    ];

    if (this._memo.value) {
      targets.push({ type: "MEMO", value: this._memo.value });
    }

    this._rankingOrderEntityList.forEach((item, index) => {
      if (item.itemName) {
        targets.push({ type: "ITEM_NAME", itemIndex: index, value: item.itemName });
      }
      if (item.memo) {
        targets.push({ type: "ITEM_MEMO", itemIndex: index, value: item.memo });
      }
    });

    return targets;
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
      rankingOrderEntityList: this._rankingOrderEntityList.map((e) => {
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
    return ok(undefined);
  }
}
