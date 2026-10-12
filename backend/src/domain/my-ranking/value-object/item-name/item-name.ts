import { err, ok, type Result } from "neverthrow";

/**
 * 項目名の生成失敗
 */
export type ItemNameError = { type: "ITEM_NAME_TOO_LONG"; max: number };

/**
 * 項目名
 */
export class ItemName {
  static readonly MAX_LENGTH = 100;
  private readonly _value: string | null;

  /**
   * @param itemName 前後の空白を除去済みの項目名（未入力は null）
   */
  private constructor(itemName: string | null) {
    this._value = itemName;
  }

  get value(): string | null {
    return this._value;
  }

  /**
   * 外部からの入力値から生成する（前後の空白は除去し、空の場合は未入力として null にする）
   * @param itemName 項目名
   * @returns 成功時は項目名、上限文字数超過の場合はその内容を持つ Result
   */
  static create(itemName: string | null): Result<ItemName, ItemNameError> {
    const trimmed = itemName?.trim() ?? "";

    if (!trimmed) {
      return ok(new ItemName(null));
    }

    if (trimmed.length > ItemName.MAX_LENGTH) {
      return err({ type: "ITEM_NAME_TOO_LONG", max: ItemName.MAX_LENGTH });
    }

    return ok(new ItemName(trimmed));
  }

  /**
   * 永続化済みの値など、制約を満たすことが保証された値から生成する
   * @param itemName 項目名
   * @returns 項目名
   * @throws 制約を満たさない場合（呼び出し側の不具合）
   */
  static of(itemName: string | null): ItemName {
    return ItemName.create(itemName).match(
      (name) => name,
      (error) => { throw new Error(`項目名が不正です。type:${error.type}`); },
    );
  }
}
