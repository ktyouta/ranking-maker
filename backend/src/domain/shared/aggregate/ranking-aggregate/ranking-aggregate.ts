import { UserId } from "../../../user";
import { RankingOrderEntity } from "../../entity";
import { RankingId, RankingTitle } from "../../value-object";

/**
 * ランキング集約
 */
export class RankingAggregate {

  constructor(private readonly _rankingId: RankingId,
    private _rankingTitle: RankingTitle,
    private _memo: string,
    private readonly _userId: UserId,
    private _rankingOrderEntityList: RankingOrderEntity[]
  ) { }

  get rankingId() {
    return this._rankingId.value;
  }

  get rankingTitle() {
    return this._rankingTitle.value;
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
