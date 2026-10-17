import { err, ok, type Result } from "neverthrow";

/**
 * 項目メモの生成失敗
 */
export type ItemMemoError = { type: "ITEM_MEMO_TOO_LONG"; max: number };

/**
 * 項目メモ
 */
export class ItemMemo {
  /** 最大文字数（UTF-16 コード単位。通常の日本語は 1文字=1、絵文字等は 2 でカウント） */
  static readonly MAX_LENGTH = 1000;

  private readonly _value: string | null;

  /**
   * @param itemMemo 上限文字数以内の項目メモ
   */
  private constructor(itemMemo: string) {
    this._value = itemMemo;
  }

  get value() {
    return this._value;
  }

  /**
   * 外部からの入力値から生成する
   * @param itemMemo 項目メモ
   * @returns 成功時は項目メモ、上限文字数超過の場合はその内容を持つ Result
   */
  static create(itemMemo: string): Result<ItemMemo, ItemMemoError> {
    if (itemMemo.length > ItemMemo.MAX_LENGTH) {
      return err({ type: "ITEM_MEMO_TOO_LONG", max: ItemMemo.MAX_LENGTH });
    }

    return ok(new ItemMemo(itemMemo));
  }

  /**
   * 永続化済みの値など、制約を満たすことが保証された値から生成する
   * @param itemMemo 項目メモ
   * @returns 項目メモ
   * @throws 制約を満たさない場合（呼び出し側の不具合）
   */
  static of(itemMemo: string): ItemMemo {
    return ItemMemo.create(itemMemo).match(
      (memo) => memo,
      (error) => { throw new Error(`項目メモが不正です。type:${error.type}`); },
    );
  }
}
