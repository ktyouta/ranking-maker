import { describe, it, expect, vi } from "vitest";
import { UpdateUserThemeUsecase } from "..";
import { UserId } from "../../../../domain/shared";
import { UserAggregate, UserTheme, type IUpdateUserThemeRepository } from "../../../../domain/user";

const USER_ID = "01ARZ3NDEKTSV4RRFFQ69G5FAV";

function createCurrentUser() {
  return UserAggregate.reconstruct({
    id: USER_ID,
    name: "testuser",
    birthday: "19900101",
    theme: UserTheme.LAVENDER,
    loginCredentialId: "01BX5ZZKBKACTAV9WEVGEMMVRZ",
    loginId: "testuser",
    passwordHash: "hash",
    salt: "salt",
    deleteFlg: false,
  });
}

function createRepository(user: UserAggregate | null, updated: boolean) {
  return {
    findUser: vi.fn<IUpdateUserThemeRepository["findUser"]>().mockResolvedValue(user),
    updateTheme: vi.fn<IUpdateUserThemeRepository["updateTheme"]>().mockResolvedValue(updated),
  } satisfies IUpdateUserThemeRepository;
}

describe("UpdateUserThemeUsecase", () => {
  it("許容値のテーマの場合、テーマを変更したユーザーを保存すること", async () => {
    const user = createCurrentUser();
    const repository = createRepository(user, true);
    const usecase = new UpdateUserThemeUsecase(repository);

    const result = await usecase.execute({ userId: UserId.of(USER_ID), theme: UserTheme.TEAL });

    expect(result.isOk()).toBe(true);
    const [savedUser] = repository.updateTheme.mock.calls[0] ?? [];
    expect(savedUser).toBe(user);
    expect(savedUser?.toSnapshot().theme).toBe(UserTheme.TEAL);
  });

  it("ユーザーが存在しない場合、NOT_FOUND を返し、更新しないこと", async () => {
    const repository = createRepository(null, true);
    const usecase = new UpdateUserThemeUsecase(repository);

    const result = await usecase.execute({ userId: UserId.of(USER_ID), theme: UserTheme.TEAL });

    expect(result._unsafeUnwrapErr()).toEqual({ type: "NOT_FOUND" });
    expect(repository.updateTheme).not.toHaveBeenCalled();
  });

  it("更新対象がなかった場合、NOT_FOUND を返すこと", async () => {
    const usecase = new UpdateUserThemeUsecase(createRepository(createCurrentUser(), false));

    const result = await usecase.execute({ userId: UserId.of(USER_ID), theme: UserTheme.TEAL });

    expect(result._unsafeUnwrapErr()).toEqual({ type: "NOT_FOUND" });
  });

  it("許容値以外のテーマの場合、INVALID_INPUT を項目名とともに返し、DB を問い合わせないこと", async () => {
    const repository = createRepository(createCurrentUser(), true);
    const usecase = new UpdateUserThemeUsecase(repository);

    const result = await usecase.execute({ userId: UserId.of(USER_ID), theme: "blue" });

    expect(result._unsafeUnwrapErr()).toEqual({ type: "INVALID_INPUT", errors: [{ field: "theme", error: { type: "USER_THEME_INVALID" } }] });
    expect(repository.findUser).not.toHaveBeenCalled();
    expect(repository.updateTheme).not.toHaveBeenCalled();
  });
});
