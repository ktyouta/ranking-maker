import { and, eq } from "drizzle-orm";
import type { UserId } from "../../../domain";
import type { DbClient } from "../../../infrastructure/db";
import { userLoginMaster, userMaster } from "../../../infrastructure/db";
import type { IDeleteUserRepository } from "./delete-user.repository.interface";

export class DeleteUserRepository implements IDeleteUserRepository {
  constructor(private readonly db: DbClient) { }

  async deleteUser(userId: UserId): Promise<boolean> {
    const now = new Date().toISOString();
    const result = await this.db
      .update(userMaster)
      .set({ deleteFlg: true, updatedAt: now })
      .where(
        and(
          eq(userMaster.id, userId.value),
          eq(userMaster.deleteFlg, false)
        )
      )
      .returning();
    return result.length > 0;
  }

  async deleteLoginUser(userId: UserId): Promise<void> {
    const now = new Date().toISOString();
    await this.db
      .update(userLoginMaster)
      .set({ deleteFlg: true, updatedAt: now })
      .where(
        and(
          eq(userLoginMaster.userId, userId.value),
          eq(userLoginMaster.deleteFlg, false)
        )
      );
  }
}
