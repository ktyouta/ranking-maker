import type { UserId } from "../../../shared";
import type { UserLoginEntity, LoginId } from "../../../user";

/**
 * ログインリポジトリインターフェース
 */
export interface IUserLoginRepository {
  /**
   * ログインID（ユーザー名）でログイン資格情報を取得
   * @param loginId ログイン時に入力されたユーザー名
   * @returns 削除されていない資格情報（存在しない場合は undefined）
   */
  getLoginUser(loginId: LoginId): Promise<UserLoginEntity | undefined>;

  /**
   * 最終ログイン日時を更新
   */
  updateLastLoginDate(userId: UserId): Promise<void>;
}
