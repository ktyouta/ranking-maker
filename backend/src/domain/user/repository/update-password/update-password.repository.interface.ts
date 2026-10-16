import type { UserId } from "../../../shared";
import type { UserLoginEntity } from "../../entity";

/**
 * パスワード変更リポジトリインターフェース
 */
export interface IUpdatePasswordRepository {
  /**
   * ユーザーIDでログイン資格情報を取得
   */
  getLoginUser(userId: UserId): Promise<UserLoginEntity | undefined>;

  /**
   * ログイン資格情報のパスワードを保存する
   * @param userLogin パスワードを変更したログイン資格情報
   * @returns 更新できた場合は true（削除済み・存在しない場合は false）
   */
  updateLoginUser(userLogin: UserLoginEntity): Promise<boolean>;
}
