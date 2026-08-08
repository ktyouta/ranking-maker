/**
 * 処理結果を表す型。
 *
 * 期待される失敗（バリデーション違反など）を、例外ではなく値として
 * 呼び出し側に返すために用いる。
 * - success: true  … value に成功値を持つ
 * - success: false … error に失敗情報を持つ
 */
export type Result<T, E> =
  | { readonly success: true; readonly value: T }
  | { readonly success: false; readonly error: E };

/**
 * 成功結果を生成する
 * @param value 成功値
 * @returns 成功を表す Result
 */
export function ok<T>(value: T): Result<T, never> {
  return { success: true, value };
}

/**
 * 失敗結果を生成する
 * @param error 失敗情報
 * @returns 失敗を表す Result
 */
export function fail<E>(error: E): Result<never, E> {
  return { success: false, error };
}
