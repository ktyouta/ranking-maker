import type { UserId } from "../../../domain/shared";
import type { IGetUserProfileRepository, UserProfile } from "../../../domain/user";

/**
 * 認証済みユーザー取得ユースケース（authMiddleware専用）
 */
export class GetAuthenticatedUserUsecase {
  constructor(private readonly repository: IGetUserProfileRepository) { }

  async execute(userId: UserId): Promise<UserProfile | undefined> {
    return await this.repository.findById(userId);
  }
}
