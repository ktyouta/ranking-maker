import type { UserId } from "../../../shared";
import type { UserAggregate } from "../../aggregate";

/**
 * パスワード変更リポジトリインターフェース
 */
export interface IUpdatePasswordRepository {
  /**
   * ユーザーIDでユーザーを取得
   */
  findUser(userId: UserId): Promise<UserAggregate | null>;

  /**
   * ユーザーのパスワードを保存する
   * @param user パスワードを変更したユーザー
   * @returns 更新できた場合は true（削除済み・存在しない場合は false）
   */
  updateUser(user: UserAggregate): Promise<boolean>;
}
