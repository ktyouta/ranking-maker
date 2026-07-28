import type { UserId, UserPassword } from "../../../domain";
import type { UserLoginMaster } from "../../../infrastructure/db";

export interface IUserPasswordRepository {
  getLoginUser(userId: UserId): Promise<UserLoginMaster | undefined>;
  updateLoginUser(userId: UserId, password: UserPassword): Promise<UserLoginMaster | undefined>;
}
