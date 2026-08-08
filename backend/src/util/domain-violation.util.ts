import type { ValidationErrorType } from "../types";
import type { Violation } from "./violation";

/**
 * ドメインルール違反(Violation)を API レスポンス用の ValidationErrorType に写像する。
 *
 * ドメイン層は presentation の型を知らないため、境界であるこのユーティリティで変換する。
 * これにより Zod バリデーションエラー(formatZodErrors)と同一の 422 レスポンス形状に統一できる。
 * @param violations ドメインルール違反の一覧
 * @returns API レスポンス用のバリデーションエラー一覧
 */
export function toValidationErrors(violations: Violation[]): ValidationErrorType[] {
  return violations.map((violation) => ({
    field: violation.field,
    message: violation.message,
  }));
}
