import type { UserId, UserPassword } from "../../../domain";
import type { UserLoginMaster } from "../../../infrastructure/db";
import type { IUserPasswordRepository } from "../repository";

export class UserPasswordService {
  constructor(private readonly repository: IUserPasswordRepository) { }

  async getLoginUser(userId: UserId): Promise<UserLoginMaster | undefined> {
    return await this.repository.getLoginUser(userId);
  }

  async updateLoginUser(userId: UserId, newPassword: UserPassword) {
    return await this.repository.updateLoginUser(userId, newPassword);
  }
}
