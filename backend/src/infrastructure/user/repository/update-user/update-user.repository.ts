import { and, eq, ne } from "drizzle-orm";
import { UserBirthday, UserEntity, UserTheme } from "../../../../domain/user";
import { UserId, UserName } from "../../../../domain/shared";
import type { IUpdateUserRepository } from "../../../../domain/user";
import type { Database } from "../../../db";
import { userLoginMaster, userMaster } from "../../../db";

/**
 * ユーザー更新リポジトリ実装
 */
export class UpdateUserRepository implements IUpdateUserRepository {
  constructor(private readonly db: Database) { }

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

  async findUser(userId: UserId): Promise<UserEntity | undefined> {
    const result = await this.db
      .select()
      .from(userMaster)
      .where(
        and(
          eq(userMaster.id, userId.value),
          eq(userMaster.deleteFlg, false)
        )
      );
    const row = result[0];
    if (!row) {
      return undefined;
    }
    if (row.birthday === null) {
      throw new Error(`生年月日が登録されていないユーザーです。userId:${row.id}`);
    }
    return new UserEntity(
      UserId.of(row.id),
      UserName.of(row.name),
      UserBirthday.of(row.birthday),
      UserTheme.of(row.theme)
    );
  }

  async updateUserWithLogin(user: UserEntity): Promise<boolean> {
    const now = new Date().toISOString();
    const [, updateResult] = await this.db.batch([
      this.db.update(userLoginMaster)
        .set({ loginId: user.userName, updatedAt: now })
        .where(
          and(
            eq(userLoginMaster.userId, user.userId),
            eq(userLoginMaster.deleteFlg, false)
          )
        ),
      this.db.update(userMaster)
        .set({
          name: user.userName,
          birthday: user.userBirthday,
          updatedAt: now,
        })
        .where(
          and(
            eq(userMaster.id, user.userId),
            eq(userMaster.deleteFlg, false)
          )
        )
        .returning(),
    ]);

    return updateResult.length > 0;
  }
}
