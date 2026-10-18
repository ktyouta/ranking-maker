import type { UserId } from "../../../shared";
import type { UserAggregate } from "../../aggregate";

/**
 * ユーザー削除リポジトリインターフェース
 */
export interface IDeleteUserRepository {
  /**
   * ユーザーIDでユーザーを取得
   */
  findUser(userId: UserId): Promise<UserAggregate | null>;

  /**
   * ユーザーとログイン情報をアトミックに論理削除する
   */
  deleteUser(user: UserAggregate): Promise<boolean>;
}
