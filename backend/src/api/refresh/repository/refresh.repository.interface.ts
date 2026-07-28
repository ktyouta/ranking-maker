import type { UserMaster } from "../../../infrastructure/db";
import type { UserId } from "../../../domain";

/**
 * リフレッシュリポジトリインターフェース
 */
export interface IRefreshRepository {
  /**
   * ユーザーIDでユーザー情報を取得
   * @param userId ユーザーID
   */
  findByUserId(userId: UserId): Promise<UserMaster | undefined>;
}
