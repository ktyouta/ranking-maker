/**
 * 判定対象の種類
 */
type ContentModerationTargetType = "TITLE" | "MEMO" | "ITEM_NAME" | "ITEM_MEMO" | "TAG_NAME";

/**
 * 不適切内容チェックの判定対象
 */
export class ContentModerationTarget {

  private constructor(private readonly _type: ContentModerationTargetType,
    private readonly _value: string,
    private readonly _itemIndex: number | null,
  ) {
    if (!_value) {
      throw new Error("判定対象の値が設定されていません。");
    }
    if (_itemIndex !== null && (!Number.isInteger(_itemIndex) || _itemIndex < 0)) {
      throw new Error("判定対象の項目の位置が不正です。");
    }
  }

  /**
   * タイトルの判定対象を生成
   * @param value タイトル
   */
  static title(value: string): ContentModerationTarget {
    return new ContentModerationTarget("TITLE", value, null);
  }

  /**
   * メモの判定対象を生成
   * @param value メモ
   */
  static memo(value: string): ContentModerationTarget {
    return new ContentModerationTarget("MEMO", value, null);
  }

  /**
   * 項目名の判定対象を生成
   * @param itemIndex 項目の位置（0始まり）
   * @param value 項目名
   */
  static itemName(itemIndex: number, value: string): ContentModerationTarget {
    return new ContentModerationTarget("ITEM_NAME", value, itemIndex);
  }

  /**
   * 項目メモの判定対象を生成
   * @param itemIndex 項目の位置（0始まり）
   * @param value 項目メモ
   */
  static itemMemo(itemIndex: number, value: string): ContentModerationTarget {
    return new ContentModerationTarget("ITEM_MEMO", value, itemIndex);
  }

  /**
   * タグ名の判定対象を生成
   * @param value タグ名
   */
  static tagName(value: string): ContentModerationTarget {
    return new ContentModerationTarget("TAG_NAME", value, null);
  }

  get type(): ContentModerationTargetType {
    return this._type;
  }

  get value(): string {
    return this._value;
  }

  get itemIndex(): number | null {
    return this._itemIndex;
  }
}
