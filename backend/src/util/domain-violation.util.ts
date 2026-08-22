import type { ValidationErrorType } from "../types";

/**
 * field/message を持つ違反情報（Violation・ContentModerationViolation 等）を
 * API レスポンス用の ValidationErrorType に写像する。
 *
 * ドメイン層は presentation の型を知らないため、境界であるこのユーティリティで変換する。
 * これにより Zod バリデーションエラー(formatZodErrors)と同一の 422 レスポンス形状に統一できる。
 * 呼び出し元の違反一覧が具体的にどのドメイン型（Violation・ContentModerationViolation 等）か
 * を問わないよう、引数は field/message を持つ構造型として受け取る。
 * @param violations field/message を持つ違反情報の一覧
 * @returns API レスポンス用のバリデーションエラー一覧
 */
export function toValidationErrors(violations: readonly { readonly field: string; readonly message: string }[]): ValidationErrorType[] {
  return violations.map((violation) => ({
    field: violation.field,
    message: violation.message,
  }));
}
