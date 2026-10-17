import { and, eq, ne } from "drizzle-orm";
import { type IUserNameUniquenessRepository, UserName } from "../../../../domain";
import { UserId } from "../../../../domain/shared";
import { userMaster, type Database } from "../../../db";

/**
 * ユーザー名一意性判定リポジトリ実装
 */
export class UserNameUniquenessRepository implements IUserNameUniquenessRepository {
  constructor(private readonly db: Database) { }

  /**
   * 同名ユーザーの取得
   * userId 自身は除外する（更新時の自己重複を防ぐ）。
   */
  async findUser(userName: UserName, userId: UserId): Promise<{ id: string }[]> {
    const result = await this.db
      .select({
        id: userMaster.id,
      })
      .from(userMaster)
      .where(and(
        eq(userMaster.deleteFlg, false),
        eq(userMaster.name, userName.value),
        ne(userMaster.id, userId.value),
      ));

    return result;
  }
}
