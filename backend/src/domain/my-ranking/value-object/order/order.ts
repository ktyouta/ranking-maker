import { err, ok, type Result } from "neverthrow";

/**
 * ランキングオーダーの生成失敗
 */
export type OrderError = { type: "ORDER_INVALID"; min: number };

/**
 * ランキングオーダー
 */
export class Order {
  static readonly MIN = 1;
  private readonly _value: number;

  /**
   * @param order MIN 以上の整数の順位
   */
  private constructor(order: number) {
    this._value = order;
  }

  get value(): number {
    return this._value;
  }

  /**
   * 外部からの入力値から生成する
   * @param order 順位
   * @returns 成功時はランキングオーダー、MIN 以上の整数でない場合はその内容を持つ Result
   */
  static create(order: number): Result<Order, OrderError> {
    if (!Number.isInteger(order) || order < Order.MIN) {
      return err({ type: "ORDER_INVALID", min: Order.MIN });
    }

    return ok(new Order(order));
  }

  /**
   * 永続化済みの値など、制約を満たすことが保証された値から生成する
   * @param order 順位
   * @returns ランキングオーダー
   * @throws 制約を満たさない場合（呼び出し側の不具合）
   */
  static of(order: number): Order {
    return Order.create(order).match(
      (value) => value,
      (error) => { throw new Error(`ランキング順位が不正です。type:${error.type} order:${order}`); },
    );
  }
}
