import type { UserMaster } from "../../../infrastructure/db";
import type { UserId, UserName } from "../../../domain";

export interface IUpdateUserRepository {
  checkUserNameExists(userId: UserId, userName: UserName): Promise<boolean>;
  updateUser(userId: UserId, userName: string, userBirthday: string): Promise<UserMaster | undefined>;
  updateLoginUser(userId: UserId, userName: string): Promise<void>;
}
