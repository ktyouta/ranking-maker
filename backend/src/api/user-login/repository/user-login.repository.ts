import { and, eq } from "drizzle-orm";
import type { UserId, UserName } from "../../../domain";
import type { Database, UserLoginMaster, UserMaster } from "../../../infrastructure/db";
import { userLoginMaster, userMaster } from "../../../infrastructure/db";
import type { IUserLoginRepository } from "./user-login.repository.interface";

export class UserLoginRepository implements IUserLoginRepository {
  constructor(private readonly db: Database) { }

  async getLoginUser(loginId: UserName): Promise<UserLoginMaster | undefined> {
    const result = await this.db
      .select()
      .from(userLoginMaster)
      .where(
        and(
          eq(userLoginMaster.loginId, loginId.value),
          eq(userLoginMaster.deleteFlg, false)
        )
      );
    return result[0];
  }

  async getUserInfo(userId: UserId): Promise<UserMaster | undefined> {
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

  async updateLastLoginDate(userId: UserId): Promise<void> {
    const now = new Date().toISOString();
    await this.db
      .update(userMaster)
      .set({ lastLoginDate: now, updatedAt: now })
      .where(eq(userMaster.id, userId.value));
  }
}
