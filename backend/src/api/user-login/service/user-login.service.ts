import type { UserId, UserName } from "../../../domain";
import type { UserLoginMaster, UserMaster } from "../../../infrastructure/db";
import type { IUserLoginRepository } from "../repository";

export class UserLoginService {
  constructor(private readonly repository: IUserLoginRepository) { }

  async getLoginUser(loginId: UserName): Promise<UserLoginMaster | undefined> {
    return await this.repository.getLoginUser(loginId);
  }

  async getUserInfo(userId: UserId): Promise<UserMaster | undefined> {
    return await this.repository.getUserInfo(userId);
  }

  async updateLastLoginDate(userId: UserId): Promise<void> {
    await this.repository.updateLastLoginDate(userId);
  }
}
