import type { UserId, UserPassword } from "../../../domain";
import type { UserLoginMaster } from "../../../infrastructure/db";
import type { IUserPasswordRepository } from "../repository";

export class UserPasswordService {
  constructor(private readonly repository: IUserPasswordRepository) { }

  async getLoginUser(userId: UserId): Promise<UserLoginMaster | undefined> {
    return await this.repository.getLoginUser(userId);
  }

  isMatchPassword(password: UserPassword, loginInfo: UserLoginMaster): boolean {
    const encoder = new TextEncoder();
    const encodedInput = encoder.encode(password.value);
    const encodedStored = encoder.encode(loginInfo.passwordHash);

    if (encodedInput.length !== encodedStored.length) {
      return false;
    }

    if (!crypto.subtle.timingSafeEqual(encodedInput, encodedStored)) {
      return false;
    }

    return true;
  }

  async updateLoginUser(userId: UserId, newPassword: UserPassword) {
    return await this.repository.updateLoginUser(userId, newPassword);
  }
}
