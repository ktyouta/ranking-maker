import type { UserMaster } from "../../infrastructure/db";
import type { UserId } from "../../domain";

/**
 * 認証リポジトリインターフェース
 */
export interface IAuthRepository {
  /**
   * ユーザーIDでユーザー情報を取得
   * @param userId ユーザーID
   */
  findByUserId(userId: UserId): Promise<UserMaster | undefined>;
}
