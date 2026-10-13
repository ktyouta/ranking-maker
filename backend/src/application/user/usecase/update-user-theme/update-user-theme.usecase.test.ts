import { describe, it, expect, vi } from "vitest";
import { UpdateUserThemeUsecase } from "..";
import { UserId } from "../../../../domain/shared";
import { UserTheme, type IUpdateUserThemeRepository } from "../../../../domain/user";

const USER_ID = "01ARZ3NDEKTSV4RRFFQ69G5FAV";

function createRepository(updated: boolean) {
  return {
    updateTheme: vi.fn<IUpdateUserThemeRepository["updateTheme"]>().mockResolvedValue(updated),
  } satisfies IUpdateUserThemeRepository;
}

describe("UpdateUserThemeUsecase", () => {
  it("許容値のテーマの場合、テーマを更新すること", async () => {
    const repository = createRepository(true);
    const usecase = new UpdateUserThemeUsecase(repository);

    const result = await usecase.execute({ userId: UserId.of(USER_ID), theme: UserTheme.TEAL });

    expect(result.isOk()).toBe(true);
    const [, theme] = vi.mocked(repository.updateTheme).mock.calls[0];
    expect(theme.value).toBe(UserTheme.TEAL);
  });

  it("ユーザーが存在しない場合、NOT_FOUND を返すこと", async () => {
    const usecase = new UpdateUserThemeUsecase(createRepository(false));

    const result = await usecase.execute({ userId: UserId.of(USER_ID), theme: UserTheme.TEAL });

    expect(result._unsafeUnwrapErr()).toEqual({ type: "NOT_FOUND" });
  });

  it("許容値以外のテーマの場合、INVALID_INPUT を項目名とともに返し、DB を問い合わせないこと", async () => {
    const repository = createRepository(true);
    const usecase = new UpdateUserThemeUsecase(repository);

    const result = await usecase.execute({ userId: UserId.of(USER_ID), theme: "blue" });

    expect(result._unsafeUnwrapErr()).toEqual({ type: "INVALID_INPUT", errors: [{ field: "theme", error: { type: "USER_THEME_INVALID" } }] });
    expect(repository.updateTheme).not.toHaveBeenCalled();
  });
});
