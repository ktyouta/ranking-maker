import type { EnvConfig } from "../../../../config";
import { AccessToken, Pepper, RefreshToken } from "../../../../domain/auth";
import type { IUserLoginRepository } from "../../../../domain/auth";
import { UserId, UserName } from "../../../../domain/shared";
import type { IGetUserProfileRepository } from "../../../../domain/user";
import { LoginResultDto } from "../../dto";

/**
 * ログインユースケース
 */
export class LoginUsecase {
  constructor(
    private readonly loginRepository: IUserLoginRepository,
    private readonly userProfileRepository: IGetUserProfileRepository,
    private readonly config: EnvConfig
  ) { }

  async execute(name: string, password: string): Promise<LoginResultDto | null> {
    // ユーザー名の制約を満たさない名前のユーザーは存在しないため、DB を問い合わせずに認証失敗とする
    const loginId = UserName.create(name);
    if (loginId.isErr()) {
      return null;
    }
    const credential = await this.loginRepository.getLoginUser(loginId.value);
    if (!credential) {
      return null;
    }

    const pepper = new Pepper(this.config.pepper);
    const isValid = await credential.verifyPassword(password, pepper);
    if (!isValid) {
      return null;
    }

    const userId = UserId.of(credential.userId);
    const userInfo = await this.userProfileRepository.findById(userId);
    if (!userInfo) {
      return null;
    }

    const accessToken = await AccessToken.create(userId, this.config);
    const refreshToken = await RefreshToken.create(userId, this.config);

    await this.loginRepository.updateLastLoginDate(userId);

    return new LoginResultDto(userInfo, accessToken, refreshToken);
  }
}
