import { and, eq } from "drizzle-orm";
import type { UserId } from "../../domain";
import type { Database, UserMaster } from "../../infrastructure/db";
import { userMaster } from "../../infrastructure/db";
import type { IAuthRepository } from "./auth.repository.interface";

/** 認証リポジトリ実装 */
export class AuthRepository implements IAuthRepository {
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
