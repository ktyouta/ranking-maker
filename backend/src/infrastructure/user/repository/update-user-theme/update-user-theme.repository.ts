import { and, eq } from "drizzle-orm";
import { UserAggregate, type IUpdateUserThemeRepository } from "../../../../domain";
import type { UserId } from "../../../../domain/shared";
import type { Database } from "../../../db";
import { userLoginMaster, userMaster } from "../../../db";

/**
 * ユーザーテーマ更新リポジトリ実装
 */
export class UpdateUserThemeRepository implements IUpdateUserThemeRepository {
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

  /**
   * ユーザーのテーマを保存する
   * @param user テーマを変更したユーザー
   * @returns 更新できた場合は true（削除済み・存在しない場合は false）
   */
  async updateTheme(user: UserAggregate): Promise<boolean> {
    const now = new Date().toISOString();
    const userSnapshot = user.toSnapshot();

    const result = await this.db
      .update(userMaster)
      .set({ theme: userSnapshot.theme, updatedAt: now })
      .where(
        and(
          eq(userMaster.id, userSnapshot.id),
          eq(userMaster.deleteFlg, false)
        )
      )
      .returning();

    return result.length > 0;
  }
}
