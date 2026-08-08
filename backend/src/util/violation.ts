/**
 * ドメインルール違反を表す型。
 *
 * - field   … 違反箇所を示す論理的なパス（例: "items"）
 * - message … 表示用メッセージ
 *
 * presentation の ValidationErrorType と同形だが、こちらは層に依存しない
 * 汎用プリミティブとして扱う。境界での写像は toValidationErrors で行う。
 */
export type Violation = {
  readonly field: string;
  readonly message: string;
};
