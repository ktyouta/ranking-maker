import type { UserEntity } from "../../entity";
import type { UserId, UserName } from "../../../shared";

/**
 * ユーザー更新リポジトリインターフェース
 */
export interface IUpdateUserRepository {
  /**
   * 自分以外に同名のユーザーが存在するかチェック
   */
  checkUserNameExists(userId: UserId, userName: UserName): Promise<boolean>;

  /**
   * ユーザー取得（削除されていないユーザーのみ）
   * @param userId 取得対象のユーザーID
   * @returns ユーザー（存在しない・削除済みの場合は undefined）
   * @throws 生年月日が登録されていない場合（新規登録では必ず登録されるため）
   */
  findUser(userId: UserId): Promise<UserEntity | undefined>;

  /**
   * ユーザーとログイン情報をアトミックに更新する
   * ユーザー名はログインIDとしても保存する
   * @param user プロフィールを変更したユーザー
   * @returns 更新できた場合は true（削除済み・存在しない場合は false）
   */
  updateUserWithLogin(user: UserEntity): Promise<boolean>;
}
