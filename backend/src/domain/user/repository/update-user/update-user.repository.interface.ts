import type { UserId } from "../../../shared";
import type { UserAggregate } from "../../aggregate";

/**
 * ユーザー更新リポジトリインターフェース
 */
export interface IUpdateUserRepository {
  /**
   * ユーザー取得（削除されていないユーザーのみ）
   * @param userId 取得対象のユーザーID
   * @returns ユーザー（存在しない・削除済みの場合は null）
   * @throws 生年月日・パスワードのハッシュ・ソルトが登録されていない場合（新規登録では必ず登録されるため）
   */
  findUser(userId: UserId): Promise<UserAggregate | null>;

  /**
   * ユーザーとログイン情報をアトミックに更新する
   * ユーザー名はログインIDとしても保存する
   * @param user プロフィールを変更したユーザー
   * @returns 更新できた場合は true（削除済み・存在しない場合は false）
   */
  updateUser(user: UserAggregate): Promise<boolean>;
}
