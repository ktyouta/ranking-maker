import { and, eq } from "drizzle-orm";
import { UserId } from "../../../../domain/shared";
import { UserAggregate, type IUpdatePasswordRepository } from "../../../../domain/user";
import type { Database } from "../../../db";
import { userLoginMaster, userMaster } from "../../../db";

/**
 * パスワード変更リポジトリ実装
 */
export class UpdatePasswordRepository implements IUpdatePasswordRepository {
  constructor(private readonly db: Database) { }

  async findUser(userId: UserId): Promise<UserAggregate | null> {
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
          eq(userMaster.id, userId.value),
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

  async updateUser(user: UserAggregate): Promise<boolean> {
    const now = new Date().toISOString();
    const userSnapshot = user.toSnapshot();

    const result = await this.db
      .update(userLoginMaster)
      .set({ passwordHash: userSnapshot.passwordHash, updatedAt: now })
      .where(
        and(
          eq(userLoginMaster.id, userSnapshot.loginCredentialId),
          eq(userLoginMaster.deleteFlg, false)
        )
      )
      .returning();
    return result.length > 0;
  }
}
