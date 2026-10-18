import { describe, it, expect, vi } from "vitest";
import { UpdatePasswordUsecase } from "..";
import { Pepper, UserAggregate, UserPassword, UserSalt, RawPassword } from "../../../../domain/user";
import type { IUpdatePasswordRepository } from "../../../../domain/user";
import { UserId } from "../../../../domain/shared";
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
const LOGIN_CREDENTIAL_ID = "01ARZ3NDEKTSV4RRFFQ69G5FAW";
const NOW_PASSWORD = "now-password";
const NEW_PASSWORD = "new-password";
const BODY = { nowPassword: NOW_PASSWORD, newPassword: NEW_PASSWORD, confirmPassword: NEW_PASSWORD };

async function createCurrentUser() {
  const salt = UserSalt.create();
  const passwordHash = await UserPassword.hash(RawPassword.create(NOW_PASSWORD)._unsafeUnwrap(), salt, new Pepper(testConfig.pepper));
  return UserAggregate.reconstruct({
    id: USER_ID,
    name: "testuser",
    birthday: "19900101",
    theme: "lavender",
    loginCredentialId: LOGIN_CREDENTIAL_ID,
    loginId: "testuser",
    passwordHash: passwordHash.value,
    salt: salt.value,
    deleteFlg: false,
  });
}

function createRepository(user: UserAggregate | null, updated: boolean) {
  return {
    findUser: vi.fn<IUpdatePasswordRepository["findUser"]>().mockResolvedValue(user),
    updateUser: vi.fn<IUpdatePasswordRepository["updateUser"]>().mockResolvedValue(updated),
  } satisfies IUpdatePasswordRepository;
}

describe("UpdatePasswordUsecase", () => {
  it("今のパスワードが正しい場合、新しいパスワードのハッシュで更新し、ok を返すこと", async () => {
    const user = await createCurrentUser();
    const repository = createRepository(user, true);
    const usecase = new UpdatePasswordUsecase(repository, testConfig);

    const result = await usecase.execute({ userId: UserId.of(USER_ID), body: BODY });

    expect(result.isOk()).toBe(true);
    expect(repository.updateUser).toHaveBeenCalledTimes(1);
    const [savedUser] = repository.updateUser.mock.calls[0] ?? [];
    expect(savedUser).toBe(user);
    const expectedHash = await UserPassword.hash(RawPassword.create(NEW_PASSWORD)._unsafeUnwrap(), user.salt, new Pepper(testConfig.pepper));
    expect(savedUser?.toSnapshot().passwordHash).toBe(expectedHash.value);
  });

  it("更新対象がなかった場合、NOT_FOUND を返すこと", async () => {
    const repository = createRepository(await createCurrentUser(), false);
    const usecase = new UpdatePasswordUsecase(repository, testConfig);

    const result = await usecase.execute({ userId: UserId.of(USER_ID), body: BODY });

    expect(result._unsafeUnwrapErr()).toEqual({ type: "NOT_FOUND" });
  });

  it("ユーザーが存在しない場合、NOT_FOUND を返し、パスワードを更新しないこと", async () => {
    const repository = createRepository(null, true);
    const usecase = new UpdatePasswordUsecase(repository, testConfig);

    const result = await usecase.execute({ userId: UserId.of(USER_ID), body: BODY });

    expect(result._unsafeUnwrapErr()).toEqual({ type: "NOT_FOUND" });
    expect(repository.updateUser).not.toHaveBeenCalled();
  });

  it("今のパスワードが違う場合、CURRENT_PASSWORD_MISMATCH を返し、パスワードを更新しないこと", async () => {
    const repository = createRepository(await createCurrentUser(), true);
    const usecase = new UpdatePasswordUsecase(repository, testConfig);

    const result = await usecase.execute({ userId: UserId.of(USER_ID), body: { ...BODY, nowPassword: "wrong-password" } });

    expect(result._unsafeUnwrapErr()).toEqual({ type: "CURRENT_PASSWORD_MISMATCH" });
    expect(repository.updateUser).not.toHaveBeenCalled();
  });

  it("入力値が制約を満たさない場合、INVALID_INPUT で違反をすべて項目名とともに返し、DB を問い合わせず更新しないこと", async () => {
    const repository = createRepository(await createCurrentUser(), true);
    const usecase = new UpdatePasswordUsecase(repository, testConfig);

    const result = await usecase.execute({ userId: UserId.of(USER_ID), body: { nowPassword: "", newPassword: "short", confirmPassword: "other" } });

    expect(result._unsafeUnwrapErr()).toEqual({
      type: "INVALID_INPUT",
      errors: [
        { field: "nowPassword", error: { type: "RAW_PASSWORD_EMPTY" } },
        { field: "newPassword", error: { type: "NEW_PASSWORD_TOO_SHORT", min: 8 } },
        { field: "confirmPassword", error: { type: "PASSWORD_CONFIRMATION_MISMATCH" } },
      ],
    });
    expect(repository.findUser).not.toHaveBeenCalled();
    expect(repository.updateUser).not.toHaveBeenCalled();
  });
});
