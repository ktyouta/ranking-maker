import { and, eq } from "drizzle-orm";
import type { UserId, UserPassword } from "../../../domain";
import type { Database, UserLoginMaster } from "../../../infrastructure/db";
import { userLoginMaster } from "../../../infrastructure/db";
import type { IUserPasswordRepository } from "./user-password.repository.interface";

export class UserPasswordRepository implements IUserPasswordRepository {
  constructor(private readonly db: Database) { }

  async getLoginUser(userId: UserId): Promise<UserLoginMaster | undefined> {
    const result = await this.db
      .select()
      .from(userLoginMaster)
      .where(
        and(
          eq(userLoginMaster.userId, userId.value),
          eq(userLoginMaster.deleteFlg, false)
        )
      );
    return result[0];
  }

  async updateLoginUser(userId: UserId, password: UserPassword): Promise<UserLoginMaster | undefined> {
    const now = new Date().toISOString();
    const result = await this.db
      .update(userLoginMaster)
      .set({ passwordHash: password.value, updatedAt: now })
      .where(
        and(
          eq(userLoginMaster.userId, userId.value),
          eq(userLoginMaster.deleteFlg, false)
        )
      )
      .returning();
    return result[0];
  }
}
