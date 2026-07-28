import { and, eq } from "drizzle-orm";
import type { UserId } from "../../../domain";
import type { Database, UserMaster } from "../../../infrastructure/db";
import { userMaster } from "../../../infrastructure/db";
import type { IRefreshRepository } from "./refresh.repository.interface";

/**
 * リフレッシュリポジトリ実装
 */
export class RefreshRepository implements IRefreshRepository {
  constructor(private readonly db: Database) { }

  /**
   * ユーザーIDでユーザー情報を取得
   * @param userId ユーザーID
   */
  async findByUserId(userId: UserId): Promise<UserMaster | undefined> {
    const result = await this.db
      .select()
      .from(userMaster)
      .where(
        and(
          eq(userMaster.id, userId.value),
          eq(userMaster.deleteFlg, false)
        )
      );
    return result[0];
  }
}
