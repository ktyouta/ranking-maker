import { and, eq } from "drizzle-orm";
import type { UserName } from "../../../domain";
import type { DbClient, UserMaster } from "../../../infrastructure/db";
import { userLoginMaster, userMaster } from "../../../infrastructure/db";
import type { UserEntity, UserLoginEntity } from "../entity";
import type { ICreateUserRepository } from "./create-user.repository.interface";

export class CreateUserRepository implements ICreateUserRepository {
  constructor(private readonly db: DbClient) { }

  async findByUserName(userName: UserName): Promise<UserMaster[]> {
    return await this.db
      .select()
      .from(userMaster)
      .where(
        and(
          eq(userMaster.name, userName.value),
          eq(userMaster.deleteFlg, false)
        )
      );
  }

  async insertUser(entity: UserEntity): Promise<UserMaster> {
    const now = new Date().toISOString();
    const result = await this.db
      .insert(userMaster)
      .values({
        id: entity.userId,
        name: entity.userName,
        birthday: entity.userBirthday,
        deleteFlg: false,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return result[0];
  }

  async insertLoginUser(entity: UserLoginEntity): Promise<void> {
    const now = new Date().toISOString();
    await this.db.insert(userLoginMaster).values({
      id: entity.loginId,
      userId: entity.userId,
      loginId: entity.loginName,
      passwordHash: entity.passwordHash,
      salt: entity.salt,
      authProvider: "password",
      deleteFlg: false,
      createdAt: now,
      updatedAt: now,
    });
  }
}
