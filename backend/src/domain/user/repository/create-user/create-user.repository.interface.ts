import type { UserAggregate } from "../../aggregate";

/**
 * ユーザー作成リポジトリインターフェース
 */
export interface ICreateUserRepository {
  /**
   * ユーザー情報作成
   */
  createUser(user: UserAggregate): Promise<void>;
}
