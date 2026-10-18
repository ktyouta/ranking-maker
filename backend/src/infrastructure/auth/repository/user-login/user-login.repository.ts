import { and, eq } from "drizzle-orm";
import type { IUserLoginRepository } from "../../../../domain/auth";
import type { UserId } from "../../../../domain/shared";
import { UserAggregate, type LoginId } from "../../../../domain/user";
import type { Database } from "../../../db";
import { userLoginMaster, userMaster } from "../../../db";

/**
 * ログインリポジトリ実装
 */
export class UserLoginRepository implements IUserLoginRepository {
  constructor(private readonly db: Database) { }

  async findUser(loginId: LoginId): Promise<UserAggregate | null> {
    const result = await this.db
      .select({
        userId: userMaster.id,
        name: userMaster.name,
        birthday: userMaster.birthday,
        theme: userMaster.theme,
        loginCredentialId: userLoginMaster.id,
        loginId: userLoginMaster.loginId,
        passwordHash: userLoginMaster.passwordHash,
        salt: userLoginMaster.salt,
        deleteFlg: userMaster.deleteFlg,
      })
      .from(userMaster)
      .innerJoin(userLoginMaster, eq(userMaster.id, userLoginMaster.userId))
      .where(
        and(
          eq(userLoginMaster.loginId, loginId.value),
          eq(userMaster.deleteFlg, false),
          eq(userLoginMaster.deleteFlg, false)
        )
      );
    const row = result[0];
    if (!row) {
      return null;
    }

    return UserAggregate.reconstruct({
      id: row.userId,
      name: row.name,
      birthday: row.birthday,
      theme: row.theme,
      loginCredentialId: row.loginCredentialId,
      loginId: row.loginId,
      passwordHash: row.passwordHash,
      salt: row.salt,
      deleteFlg: row.deleteFlg
    });
  }

  async updateLastLoginDate(userId: UserId): Promise<void> {
    const now = new Date().toISOString();
    await this.db
      .update(userMaster)
      .set({ lastLoginDate: now, updatedAt: now })
      .where(eq(userMaster.id, userId.value));
  }
}
