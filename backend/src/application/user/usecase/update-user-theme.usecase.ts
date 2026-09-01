import { UserId, UserTheme } from "../../../domain/user";
import type { IUpdateUserThemeRepository } from "../../../domain/user";

/**
 * ユーザーテーマ更新ユースケース
 */
export class UpdateUserThemeUsecase {
  constructor(private readonly repository: IUpdateUserThemeRepository) { }

  /**
   * @returns 更新に成功したか
   */
  async execute(userId: string, theme: string): Promise<boolean> {
    const userIdObj = UserId.of(userId);
    const themeObj = UserTheme.of(theme);

    return await this.repository.updateTheme(userIdObj, themeObj);
  }
}
