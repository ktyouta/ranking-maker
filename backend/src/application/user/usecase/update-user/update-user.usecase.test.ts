import { describe, it, expect, vi } from "vitest";
import { UpdateUserUsecase } from "..";
import { UserAggregate, UserNameUniquenessDomainService, UserTheme } from "../../../../domain/user";
import { UserId } from "../../../../domain/shared";
import type { IUpdateUserRepository, IUserNameUniquenessRepository } from "../../../../domain/user";
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
  user: UserAggregate | null,
  updated: boolean
) {
  return {
    findUser: vi.fn<IUpdateUserRepository["findUser"]>().mockResolvedValue(user),
    updateUser: vi.fn<IUpdateUserRepository["updateUser"]>().mockResolvedValue(updated),
  } satisfies IUpdateUserRepository;
}

function createUniquenessRepository(duplicated: boolean) {
  return {
    findUser: vi.fn<IUserNameUniquenessRepository["findUser"]>().mockResolvedValue(duplicated ? [{ id: "01BX5ZZKBKACTAV9WEVGEMMVRZ" }] : []),
  } satisfies IUserNameUniquenessRepository;
}

function createCurrentUser() {
  return UserAggregate.reconstruct({
    id: USER_ID,
    name: "before",
    birthday: "19900101",
    theme: UserTheme.TEAL,
    loginCredentialId: "01BX5ZZKBKACTAV9WEVGEMMVRZ",
    loginId: "before",
    passwordHash: "hash",
    salt: "salt",
    deleteFlg: false,
  });
}

function createUsecase(repository: IUpdateUserRepository, uniquenessRepository: IUserNameUniquenessRepository) {
  return new UpdateUserUsecase(repository, testConfig, new UserNameUniquenessDomainService(uniquenessRepository));
}

describe("UpdateUserUsecase", () => {
  it("名前が重複しておらずユーザーが存在する場合、プロフィールを変更したユーザーを保存し、更新後のユーザー・リフレッシュトークンを返すこと", async () => {
    const user = createCurrentUser();
    const repository = createRepository(user, true);
    const usecase = createUsecase(repository, createUniquenessRepository(false));

    const result = await usecase.execute({ userId: UserId.of(USER_ID), name: "renamed", birthday: "20000101" });

    const dto = result._unsafeUnwrap();
    expect(dto.value.user.name).toBe("renamed");
    expect(dto.value.user.birthday).toBe("20000101");
    expect(dto.value.user.theme).toBe(UserTheme.TEAL);
    expect(dto.value.refreshToken).toBeTruthy();
    const [savedUser] = repository.updateUser.mock.calls[0] ?? [];
    expect(savedUser).toBe(user);
    expect(savedUser?.toSnapshot().name).toBe("renamed");
    expect(savedUser?.toSnapshot().birthday).toBe("20000101");
    expect(savedUser?.toSnapshot().loginId).toBe("renamed");
  });

  it("名前が重複している場合、DUPLICATE_NAME を返し、更新しないこと", async () => {
    const repository = createRepository(createCurrentUser(), true);
    const usecase = createUsecase(repository, createUniquenessRepository(true));

    const result = await usecase.execute({ userId: UserId.of(USER_ID), name: "renamed", birthday: "20000101" });

    expect(result._unsafeUnwrapErr()).toEqual({ type: "DUPLICATE_NAME" });
    expect(repository.updateUser).not.toHaveBeenCalled();
  });

  it("ユーザーが存在しない場合、NOT_FOUND を返し、更新しないこと", async () => {
    const repository = createRepository(null, true);
    const usecase = createUsecase(repository, createUniquenessRepository(false));

    const result = await usecase.execute({ userId: UserId.of(USER_ID), name: "renamed", birthday: "20000101" });

    expect(result._unsafeUnwrapErr()).toEqual({ type: "NOT_FOUND" });
    expect(repository.updateUser).not.toHaveBeenCalled();
  });

  it("更新対象がなかった場合、NOT_FOUND を返すこと", async () => {
    const repository = createRepository(createCurrentUser(), false);
    const usecase = createUsecase(repository, createUniquenessRepository(false));

    const result = await usecase.execute({ userId: UserId.of(USER_ID), name: "renamed", birthday: "20000101" });

    expect(result._unsafeUnwrapErr()).toEqual({ type: "NOT_FOUND" });
  });

  it("入力値が制約を満たさない場合、INVALID_INPUT で違反をすべて項目名とともに返し、DB を問い合わせず更新しないこと", async () => {
    const repository = createRepository(createCurrentUser(), true);
    const uniquenessRepository = createUniquenessRepository(false);
    const usecase = createUsecase(repository, uniquenessRepository);

    const result = await usecase.execute({ userId: UserId.of(USER_ID), name: "", birthday: "20000431" });

    expect(result._unsafeUnwrapErr()).toEqual({
      type: "INVALID_INPUT",
      errors: [
        { field: "name", error: { type: "USER_NAME_TOO_SHORT", min: 3 } },
        { field: "birthday", error: { type: "USER_BIRTHDAY_NOT_EXIST" } },
      ],
    });
    expect(repository.findUser).not.toHaveBeenCalled();
    expect(uniquenessRepository.findUser).not.toHaveBeenCalled();
    expect(repository.updateUser).not.toHaveBeenCalled();
  });
});
