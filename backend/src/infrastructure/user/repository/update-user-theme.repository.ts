import { and, eq } from "drizzle-orm";
import type { IUpdateUserThemeRepository, UserId, UserTheme } from "../../../domain/user";
import type { Database } from "../../db";
import { userMaster } from "../../db";

/**
 * ユーザーテーマ更新リポジトリ実装
 */
export class UpdateUserThemeRepository implements IUpdateUserThemeRepository {
  constructor(private readonly db: Database) { }

  /**
   * テーマを更新する
   * @returns 更新に成功したか
   */
  async updateTheme(userId: UserId, theme: UserTheme): Promise<boolean> {
    const now = new Date().toISOString();
    const result = await this.db
      .update(userMaster)
      .set({ theme: theme.value, updatedAt: now })
      .where(
        and(
          eq(userMaster.id, userId.value),
          eq(userMaster.deleteFlg, false)
        )
      )
      .returning();

    return result.length > 0;
  }
}
