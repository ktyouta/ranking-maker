import { err, ok, Result } from "neverthrow";
import { Violation } from "../../../../util/violation";
import { UserId } from "../../../user";
import { RankingOrderEntity } from "../../entity";
import { PublicStatus, RankingId, RankingMemo, RankingTitle } from "../../value-object";

/**
 * ランキング集約の生成・再構築に渡すパラメータ
 */
type RankingAggregateParams = {
  rankingId: RankingId;
  rankingTitle: RankingTitle;
  publicStatus: PublicStatus;
  memo: RankingMemo;
  userId: UserId;
  rankingOrderEntityList: RankingOrderEntity[];
};

type RankingAggregateReconstructParams = RankingAggregateParams & {
  isDeleted: boolean;
};

/**
 * 不適切内容チェックの判定対象
 */
export type ContentModerationTarget = {
  field: string;
  value: string;
};

type RankingSnapshot = {
  id: string;
  title: string;
  memo: string | null;
  publicStatus: number;
  userId: string;
  rankingOrderEntityList: {
    id: string;
    itemName: string;
    memo: string | null;
    order: number;
  }[];
  deleteFlg: boolean;
};

/**
 * ランキング集約
 */
export class RankingAggregate {

  private constructor(private readonly _rankingId: RankingId,
    private readonly _rankingTitle: RankingTitle,
    private readonly _publicStatus: PublicStatus,
    private readonly _memo: RankingMemo,
    private readonly _userId: UserId,
    private readonly _rankingOrderEntityList: RankingOrderEntity[],
    private _deleteFlg: boolean,
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
  static create(params: RankingAggregateParams): Result<RankingAggregate, Violation[]> {
    const violations = RankingAggregate.collectItemViolations(params.rankingOrderEntityList);

    if (violations.length > 0) {
      return err(violations);
    }

    return ok(
      new RankingAggregate(
        params.rankingId,
        params.rankingTitle,
        params.publicStatus,
        params.memo,
        params.userId,
        params.rankingOrderEntityList,
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
      params.memo,
      params.userId,
      params.rankingOrderEntityList,
      params.isDeleted,
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
  private static collectItemViolations(items: RankingOrderEntity[]): Violation[] {
    const violations: Violation[] = [];

    for (const itemName of RankingAggregate.findDuplicates(items.map((e) => e.itemName))) {
      violations.push({ field: "items", message: `名称が重複しています: ${itemName}` });
    }

    for (const order of RankingAggregate.findDuplicates(items.map((e) => e.order))) {
      violations.push({ field: "items", message: `順位が重複しています: ${order}` });
    }

    return violations;
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
      if (seen.has(value)) {
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
   */
  restore() {
    if (!this._deleteFlg) {
      throw new Error(`削除されていないランキングです。`);
    }
    this._deleteFlg = false;
  }

  /**
   * 不適切内容チェックの判定対象一覧を作成する
   * @returns ユーザーが自由入力するフィールドの一覧
   */
  toModerationTargets(): ContentModerationTarget[] {
    const targets: ContentModerationTarget[] = [
      { field: "タイトル", value: this._rankingTitle.value },
    ];

    if (this._memo.value) {
      targets.push({ field: "メモ", value: this._memo.value });
    }

    this._rankingOrderEntityList.forEach((item, index) => {
      targets.push({ field: `項目名（${index + 1}件目）`, value: item.itemName });
      if (item.memo) {
        targets.push({ field: `メモ（${index + 1}件目）`, value: item.memo });
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
      userId: this._userId.value,
      rankingOrderEntityList: this._rankingOrderEntityList.map((e) => {
        return {
          id: e.id,
          itemName: e.itemName,
          memo: e.memo,
          order: e.order,
        }
      }),
      deleteFlg: this._deleteFlg,
    };
  }
}
