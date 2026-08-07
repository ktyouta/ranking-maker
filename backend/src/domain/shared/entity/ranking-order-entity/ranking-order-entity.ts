import { ItemName } from "../../value-object/item-name";
import { Order } from "../../value-object/order";
import { RankingOrderId } from "../../value-object/ranking-order-id";

/**
 * ランキングオーダーエンティティ
 */
export class RankingOrderEntity {

  constructor(private readonly _rankingOrderId: RankingOrderId,
    private _itemName: ItemName,
    private _order: Order,
    private _memo: string,
  ) { }

  get rankingOrderIdValue() {
    return this._rankingOrderId.value;
  }

  get itemName() {
    return this._itemName.value;
  }

  get order() {
    return this._order.value;
  }

  get memo() {
    return this._memo;
  }

  /**
   * オーダー名変更
   * @param itemName 
   */
  changeItemName(itemName: ItemName) {
    this._itemName = itemName;
  }

  /**
   * メモ変更
   * @param memo 
   */
  changeMemo(memo: string) {
    this._memo = memo;
  }
}
