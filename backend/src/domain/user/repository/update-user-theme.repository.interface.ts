import type { UserId, UserTheme } from "../value-object";

/**
 * ユーザーテーマ更新リポジトリインターフェース
 */
export interface IUpdateUserThemeRepository {
  /**
   * テーマを更新する
   * @returns 更新に成功したか
   */
  updateTheme(userId: UserId, theme: UserTheme): Promise<boolean>;
}
