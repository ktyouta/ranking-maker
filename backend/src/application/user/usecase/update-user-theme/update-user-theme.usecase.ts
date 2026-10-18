import { err, ok, type Result } from "neverthrow";
import type { UserId } from "../../../../domain/shared";
import type { IUpdateUserThemeRepository } from "../../../../domain/user";
import { UserTheme, type UserThemeError } from "../../../../domain/user";

/**
 * ユーザーテーマ更新の入力値の制約違反（field は入力値の項目名）
 */
export type UpdateUserThemeInputError = { field: "theme"; error: UserThemeError };

export type UpdateUserThemeError =
  | { type: "INVALID_INPUT"; errors: UpdateUserThemeInputError[] }
  | { type: "NOT_FOUND" };

type PropsType = {
  userId: UserId;
  theme: string;
}

/**
 * ユーザーテーマ更新ユースケース
 */
export class UpdateUserThemeUsecase {
  constructor(private readonly repository: IUpdateUserThemeRepository) { }

  /**
   * ユーザーのテーマを更新する
   * @param userId 更新対象のユーザーID
   * @param theme テーマ値
   * @returns 成功時は ok。
   * テーマが許容値以外の場合は INVALID_INPUT（DB は問い合わせない）、ユーザーが存在しない場合は NOT_FOUND
   */
  async execute({ userId, theme }: PropsType): Promise<Result<void, UpdateUserThemeError>> {
    // 入力値の制約チェック
    const userTheme = UserTheme.create(theme);
    if (userTheme.isErr()) {
      return err({ type: "INVALID_INPUT", errors: [{ field: "theme", error: userTheme.error }] });
    }

    const user = await this.repository.findUser(userId);
    if (!user) {
      return err({ type: "NOT_FOUND" });
    }

    user.updateTheme({ theme: userTheme.value });

    if (!(await this.repository.updateTheme(user))) {
      return err({ type: "NOT_FOUND" });
    }

    return ok(undefined);
  }
}
