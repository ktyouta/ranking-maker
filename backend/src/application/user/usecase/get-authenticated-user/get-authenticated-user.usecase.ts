import { err, ok, type Result } from "neverthrow";
import type { IGetUserProfileRepository } from "../../../../domain";
import type { UserId } from "../../../../domain/shared";
import { GetAuthenticatedUserResultDto } from "../../dto";

export type GetAuthenticatedUserError =
  { type: "NOT_FOUND" };

type PropsType = {
  userId: UserId;
}

/**
 * 認証済みユーザー取得ユースケース（authMiddleware専用）
 */
export class GetAuthenticatedUserUsecase {
  constructor(private readonly repository: IGetUserProfileRepository) { }

  /**
   * 認証済みユーザーを取得する
   * @param userId アクセストークンから取り出したユーザーID
   * @returns 成功時はユーザー情報の DTO、ユーザーが存在しない（削除済みを含む）場合は NOT_FOUND
   */
  async execute({ userId }: PropsType): Promise<Result<GetAuthenticatedUserResultDto, GetAuthenticatedUserError>> {
    const user = await this.repository.findUserProfile(userId);
    if (!user) {
      return err({ type: "NOT_FOUND" });
    }
    return ok(new GetAuthenticatedUserResultDto(user));
  }
}
