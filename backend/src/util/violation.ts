/**
 * ドメインルール違反を表す型。
 *
 * - field   … 違反箇所を示す論理的なパス（例: "items"）
 * - message … 表示用メッセージ
 */
export type Violation = {
  readonly field: string;
  readonly message: string;
};
