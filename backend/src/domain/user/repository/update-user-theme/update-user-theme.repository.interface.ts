import type { UserId } from "../../../shared";
import type { UserAggregate } from "../../aggregate";

/**
 * ユーザーテーマ更新リポジトリインターフェース
 */
export interface IUpdateUserThemeRepository {
  /**
   * ユーザーIDでユーザーを取得
   */
  findUser(userId: UserId): Promise<UserAggregate | null>;

  /**
   * ユーザーのテーマを保存する
   * @param user テーマを変更したユーザー
   * @returns 更新できた場合は true（削除済み・存在しない場合は false）
   */
  updateTheme(user: UserAggregate): Promise<boolean>;
}
