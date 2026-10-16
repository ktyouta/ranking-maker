import type { LoginIdError, RawPasswordError } from "../../../domain";

/**
 * 認証コンテキストの入力値の違反（値オブジェクトの制約違反）
 */
type AuthInputError =
  | LoginIdError
  | RawPasswordError;

/**
 * 入力値の違反を、利用者向けのメッセージに変換する
 * @param error 入力値の違反
 * @returns 利用者向けのメッセージ
 */
export function toInputErrorMessage(error: AuthInputError): string {
  switch (error.type) {
    case "LOGIN_ID_EMPTY":
      return "ユーザー名を入力してください";
    case "RAW_PASSWORD_EMPTY":
      return "パスワードを入力してください";
    default: {
      // 全てのエラー種別を網羅していることを型で保証する
      error satisfies never;
      return "入力内容が不正です";
    }
  }
}
