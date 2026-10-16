import { describe, it, expect, vi } from "vitest";
import { UpdateUserUsecase } from "..";
import { UserBirthday, UserEntity, UserTheme, UserName } from "../../../../domain/user";
import { UserId } from "../../../../domain/shared";
import type { IUpdateUserRepository } from "../../../../domain/user";
import type { EnvConfig } from "../../../../config";

const testConfig: EnvConfig = {
  accessTokenJwtKey: "test-jwt-secret-key-for-access-token",
  accessTokenExpires: "15m",
  refreshTokenJwtKey: "test-jwt-secret-key-for-refresh-token",
  refreshTokenExpires: "7d",
  pepper: "test-pepper",
  corsOrigin: ["http://localhost:5173"],
  isProduction: false,
  allowUserOperation: true,
};

const USER_ID = "01ARZ3NDEKTSV4RRFFQ69G5FAV";

function createRepository(
  user: UserEntity | undefined,
  duplicated: boolean,
  updated: boolean
) {
  return {
    checkUserNameExists: vi.fn<IUpdateUserRepository["checkUserNameExists"]>().mockResolvedValue(duplicated),
    findUser: vi.fn<IUpdateUserRepository["findUser"]>().mockResolvedValue(user),
    updateUserWithLogin: vi.fn<IUpdateUserRepository["updateUserWithLogin"]>().mockResolvedValue(updated),
  } satisfies IUpdateUserRepository;
}

function createCurrentEntity() {
  return new UserEntity(UserId.of(USER_ID), UserName.of("before"), UserBirthday.of("19900101"), UserTheme.of(UserTheme.TEAL));
}

describe("UpdateUserUsecase", () => {
  it("名前が重複しておらずユーザーが存在する場合、プロフィールを変更したユーザーを保存し、更新後のユーザー・リフレッシュトークンを返すこと", async () => {
    const user = createCurrentEntity();
    const repository = createRepository(user, false, true);
    const usecase = new UpdateUserUsecase(repository, testConfig);

    const result = await usecase.execute({ userId: UserId.of(USER_ID), name: "renamed", birthday: "20000101" });

    const dto = result._unsafeUnwrap();
    expect(dto.value.user.name).toBe("renamed");
    expect(dto.value.user.birthday).toBe("20000101");
    expect(dto.value.user.theme).toBe(UserTheme.TEAL);
    expect(dto.value.refreshToken).toBeTruthy();
    const [savedUser] = repository.updateUserWithLogin.mock.calls[0] ?? [];
    expect(savedUser).toBe(user);
    expect(savedUser?.userName).toBe("renamed");
    expect(savedUser?.userBirthday).toBe("20000101");
  });

  it("名前が重複している場合、DUPLICATE_NAME を返し、更新しないこと", async () => {
    const repository = createRepository(createCurrentEntity(), true, true);
    const usecase = new UpdateUserUsecase(repository, testConfig);

    const result = await usecase.execute({ userId: UserId.of(USER_ID), name: "renamed", birthday: "20000101" });

    expect(result._unsafeUnwrapErr()).toEqual({ type: "DUPLICATE_NAME" });
    expect(repository.updateUserWithLogin).not.toHaveBeenCalled();
  });

  it("ユーザーが存在しない場合、NOT_FOUND を返し、更新しないこと", async () => {
    const repository = createRepository(undefined, false, true);
    const usecase = new UpdateUserUsecase(repository, testConfig);

    const result = await usecase.execute({ userId: UserId.of(USER_ID), name: "renamed", birthday: "20000101" });

    expect(result._unsafeUnwrapErr()).toEqual({ type: "NOT_FOUND" });
    expect(repository.updateUserWithLogin).not.toHaveBeenCalled();
  });

  it("更新対象がなかった場合、NOT_FOUND を返すこと", async () => {
    const repository = createRepository(createCurrentEntity(), false, false);
    const usecase = new UpdateUserUsecase(repository, testConfig);

    const result = await usecase.execute({ userId: UserId.of(USER_ID), name: "renamed", birthday: "20000101" });

    expect(result._unsafeUnwrapErr()).toEqual({ type: "NOT_FOUND" });
  });

  it("入力値が制約を満たさない場合、INVALID_INPUT で違反をすべて項目名とともに返し、DB を問い合わせず更新しないこと", async () => {
    const repository = createRepository(createCurrentEntity(), false, true);
    const usecase = new UpdateUserUsecase(repository, testConfig);

    const result = await usecase.execute({ userId: UserId.of(USER_ID), name: "", birthday: "20000431" });

    expect(result._unsafeUnwrapErr()).toEqual({
      type: "INVALID_INPUT",
      errors: [
        { field: "name", error: { type: "USER_NAME_TOO_SHORT", min: 3 } },
        { field: "birthday", error: { type: "USER_BIRTHDAY_NOT_EXIST" } },
      ],
    });
    expect(repository.findUser).not.toHaveBeenCalled();
    expect(repository.checkUserNameExists).not.toHaveBeenCalled();
    expect(repository.updateUserWithLogin).not.toHaveBeenCalled();
  });
});
