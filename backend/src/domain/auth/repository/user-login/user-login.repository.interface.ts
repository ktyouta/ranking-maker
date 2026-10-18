import type { UserId } from "../../../shared";
import type { LoginId, UserAggregate } from "../../../user";

/**
 * ログインリポジトリインターフェース
 */
export interface IUserLoginRepository {
  /**
   * ログインID（ユーザー名）でユーザーを取得
   * @param loginId ログイン時に入力されたユーザー名
   * @returns 削除されていないユーザー（存在しない場合は null）
   */
  findUser(loginId: LoginId): Promise<UserAggregate | null>;

  /**
   * 最終ログイン日時を更新
   */
  updateLastLoginDate(userId: UserId): Promise<void>;
}
