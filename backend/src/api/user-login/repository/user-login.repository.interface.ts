import type { UserLoginMaster, UserMaster } from "../../../infrastructure/db";
import type { UserName, UserId } from "../../../domain";

export interface IUserLoginRepository {
  getLoginUser(loginId: UserName): Promise<UserLoginMaster | undefined>;
  getUserInfo(userId: UserId): Promise<UserMaster | undefined>;
  updateLastLoginDate(userId: UserId): Promise<void>;
}
