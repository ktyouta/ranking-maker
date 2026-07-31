import type { EnvConfig } from "../../../config";
import { RefreshToken } from "../../../domain/auth";
import { UserBirthday, UserId, UserName } from "../../../domain/user";
import type { IUpdateUserRepository, UserEntity } from "../../../domain/user";

export type UpdateUserResult =
  | { status: "duplicate" }
  | { status: "not_found" }
  | { status: "success"; entity: UserEntity; refreshToken: RefreshToken };

/**
 * ユーザー更新ユースケース
 */
export class UpdateUserUsecase {
  constructor(
    private readonly repository: IUpdateUserRepository,
    private readonly config: EnvConfig
  ) { }

  async execute(userId: string, name: string, birthday: string): Promise<UpdateUserResult> {
    const userIdObj = UserId.of(userId);
    const userName = new UserName(name);
    const userBirthday = new UserBirthday(birthday);

    const duplicated = await this.repository.checkUserNameExists(userIdObj, userName);
    if (duplicated) {
      return { status: "duplicate" };
    }

    const entity = await this.repository.updateUserWithLogin(userIdObj, userName, userBirthday);
    if (!entity) {
      return { status: "not_found" };
    }

    const refreshToken = await RefreshToken.create(userIdObj, this.config);

    return { status: "success", entity, refreshToken };
  }
}
