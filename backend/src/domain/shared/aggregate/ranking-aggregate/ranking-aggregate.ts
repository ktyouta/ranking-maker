import { UserId } from "../../../user";
import { RankingOrderEntity } from "../../entity/ranking-order-entity";
import { RankingId } from "../../value-object/ranking-id";
import { RankingTitle } from "../../value-object/ranking-title";

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
    this._rankingOrderEntityList.push(rankingOrderEntity);
  }

  /**
   * 順位重複チェック
   */
  isDuplicateOrder() {
    const rankingOrderSet = new Set(this._rankingOrderEntityList.map((e) => e.rankingOrderIdValue));
    return rankingOrderSet.size !== this._rankingOrderEntityList.length;
  }

  /**
   * ランキング名重複チェック
   * @returns 
   */
  isDuplicateItemName() {
    const itemNameSet = new Set(this._rankingOrderEntityList.map((e) => e.itemName));
    return itemNameSet.size !== this._rankingOrderEntityList.length;
  }
}
