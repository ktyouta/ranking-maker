import { and, eq } from "drizzle-orm";
import { UserLoginEntity, UserPassword, UserSalt, UserName } from "../../../../domain/user";
import type { IUpdatePasswordRepository } from "../../../../domain/user";
import { UserId } from "../../../../domain/shared";
import type { Database } from "../../../db";
import { userLoginMaster } from "../../../db";

/**
 * パスワード変更リポジトリ実装
 */
export class UpdatePasswordRepository implements IUpdatePasswordRepository {
  constructor(private readonly db: Database) { }

  async getLoginUser(userId: UserId): Promise<UserLoginEntity | undefined> {
    const result = await this.db
      .select()
      .from(userLoginMaster)
      .where(
        and(
          eq(userLoginMaster.userId, userId.value),
          eq(userLoginMaster.deleteFlg, false)
        )
      );
    const row = result[0];
    if (!row || !row.salt || !row.passwordHash) {
      return undefined;
    }
    return new UserLoginEntity(
      UserId.of(row.id),
      UserId.of(row.userId),
      UserName.of(row.loginId),
      UserPassword.of(row.passwordHash),
      UserSalt.of(row.salt)
    );
  }

  async updateLoginUser(userLogin: UserLoginEntity): Promise<boolean> {
    const now = new Date().toISOString();
    const result = await this.db
      .update(userLoginMaster)
      .set({ passwordHash: userLogin.passwordHash, updatedAt: now })
      .where(
        and(
          eq(userLoginMaster.id, userLogin.loginCredentialId),
          eq(userLoginMaster.deleteFlg, false)
        )
      )
      .returning();
    return result.length > 0;
  }
}
