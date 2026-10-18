import { err, ok, type Result } from "neverthrow";
import type { UserId } from "../../../../domain/shared";
import type { IDeleteUserRepository } from "../../../../domain/user";

export type DeleteUserError =
  { type: "NOT_FOUND" };

type PropsType = {
  userId: UserId;
}

/**
 * ユーザー削除ユースケース
 */
export class DeleteUserUsecase {
  constructor(private readonly repository: IDeleteUserRepository) { }

  async execute({ userId }: PropsType): Promise<Result<undefined, DeleteUserError>> {
    const user = await this.repository.findUser(userId);
    if (!user) {
      return err({ type: "NOT_FOUND" });
    }

    user.delete();

    if (!(await this.repository.deleteUser(user))) {
      return err({ type: "NOT_FOUND" });
    }

    return ok(undefined);
  }
}
