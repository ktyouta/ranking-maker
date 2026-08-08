import { UserId } from "../../../user";
import { RankingOrderEntity } from "../../entity";
import { PublicStatus, RankingId, RankingTitle } from "../../value-object";
import { fail, ok, Result } from "../../../../util/result";
import { Violation } from "../../../../util/violation";

/**
 * ランキング集約の生成・再構築に渡すパラメータ
 */
type RankingAggregateParams = {
  rankingId: RankingId;
  rankingTitle: RankingTitle;
  publicStatus: PublicStatus;
  memo: string;
  userId: UserId;
  rankingOrderEntityList: RankingOrderEntity[];
};

/**
 * ランキング集約
 */
export class RankingAggregate {

  private constructor(private readonly _rankingId: RankingId,
    private _rankingTitle: RankingTitle,
    private _publicStatus: PublicStatus,
    private _memo: string,
    private readonly _userId: UserId,
    private _rankingOrderEntityList: RankingOrderEntity[]
  ) { }

  /**
   * ランキング集約を生成する（新規作成・全置換更新の入口）。
   *
   * 集約の不変条件（順位・名称の重複禁止）を検証し、違反があれば
   * すべて収集して Result.fail で返す。各項目の単一フィールド検証は
   * 値オブジェクトが担うため、ここでは集約横断の一意性のみを検証する。
   * @param params 集約の構成要素
   * @returns 検証成功時は集約、失敗時は違反一覧を持つ Result
   */
  static create(params: RankingAggregateParams): Result<RankingAggregate, Violation[]> {
    const violations = RankingAggregate.collectItemViolations(params.rankingOrderEntityList);

    if (violations.length > 0) {
      return fail(violations);
    }

    return ok(
      new RankingAggregate(
        params.rankingId,
        params.rankingTitle,
        params.publicStatus,
        params.memo,
        params.userId,
        params.rankingOrderEntityList,
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
  static reconstruct(params: RankingAggregateParams): RankingAggregate {
    return new RankingAggregate(
      params.rankingId,
      params.rankingTitle,
      params.publicStatus,
      params.memo,
      params.userId,
      params.rankingOrderEntityList,
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
    return this._memo;
  }

  get userId() {
    return this._userId.value;
  }

  get rankingOrderEntityList() {
    return [...this._rankingOrderEntityList];
  }

  /**
   * ランキングタイトル変更
   * @param rankingTitle
   */
  changeRankingTitle(rankingTitle: RankingTitle) {
    this._rankingTitle = rankingTitle;
  }

  /**
   * 順位追加
   * @param rankingOrderEntity
   */
  addItem(rankingOrderEntity: RankingOrderEntity) {

    if (this.isDuplicateOrder(rankingOrderEntity)) {
      throw new Error(`順位が重複しています。order:${rankingOrderEntity.order}`);
    }

    if (this.isDuplicateItemName(rankingOrderEntity)) {
      throw new Error(`名称が重複しています。order:${rankingOrderEntity.itemName}`);
    }

    this._rankingOrderEntityList.push(rankingOrderEntity);
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
      } else {
        seen.add(value);
      }
    }

    return [...duplicated];
  }

  /**
   * 順位重複チェック
   */
  private isDuplicateOrder(rankingOrderEntity: RankingOrderEntity) {
    return !!this._rankingOrderEntityList.find((e) => e.order === rankingOrderEntity.order);
  }

  /**
   * ランキング名重複チェック
   * @returns
   */
  private isDuplicateItemName(rankingOrderEntity: RankingOrderEntity) {
    return !!this._rankingOrderEntityList.find((e) => e.itemName === rankingOrderEntity.itemName);
  }
}
