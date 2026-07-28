import { and, eq, ne } from "drizzle-orm";
import type { UserId, UserName } from "../../../domain";
import type { DbClient, UserMaster } from "../../../infrastructure/db";
import { userLoginMaster, userMaster } from "../../../infrastructure/db";
import type { IUpdateUserRepository } from "./update-user.repository.interface";

export class UpdateUserRepository implements IUpdateUserRepository {
  constructor(private readonly db: DbClient) { }

  async checkUserNameExists(userId: UserId, userName: UserName): Promise<boolean> {
    const result = await this.db
      .select()
      .from(userMaster)
      .where(
        and(
          eq(userMaster.name, userName.value),
          ne(userMaster.id, userId.value),
          eq(userMaster.deleteFlg, false)
        )
      );
    return result.length > 0;
  }

  async updateUser(userId: UserId, userName: string, userBirthday: string): Promise<UserMaster | undefined> {
    const now = new Date().toISOString();
    const result = await this.db
      .update(userMaster)
      .set({ name: userName, birthday: userBirthday, updatedAt: now })
      .where(
        and(
          eq(userMaster.id, userId.value),
          eq(userMaster.deleteFlg, false)
        )
      )
      .returning();
    return result[0];
  }

  async updateLoginUser(userId: UserId, userName: string): Promise<void> {
    const now = new Date().toISOString();
    await this.db
      .update(userLoginMaster)
      .set({ loginId: userName, updatedAt: now })
      .where(
        and(
          eq(userLoginMaster.userId, userId.value),
          eq(userLoginMaster.deleteFlg, false)
        )
      );
  }
}
