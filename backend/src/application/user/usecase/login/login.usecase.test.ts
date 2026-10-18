import { describe, it, expect, vi } from "vitest";
import { LoginUsecase } from "..";
import { Pepper, UserAggregate, UserPassword, UserSalt, RawPassword } from "../../../../domain/user";
import type { IUserLoginRepository } from "../../../../domain/user";
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

const PASSWORD = "correct-password";
const PROFILE = {
  id: "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  name: "testuser",
  birthday: "19900101",
  theme: "lavender",
};

async function createUser() {
  const salt = UserSalt.create();
  const passwordHash = await UserPassword.hash(RawPassword.create(PASSWORD)._unsafeUnwrap(), salt, new Pepper(testConfig.pepper));
  return UserAggregate.reconstruct({
    ...PROFILE,
    loginCredentialId: "01ARZ3NDEKTSV4RRFFQ69G5FAW",
    loginId: PROFILE.name,
    passwordHash: passwordHash.value,
    salt: salt.value,
    deleteFlg: false,
  });
}

function createRepository(user: UserAggregate | null) {
  return {
    findUser: vi.fn<IUserLoginRepository["findUser"]>().mockResolvedValue(user),
    updateLastLoginDate: vi.fn<IUserLoginRepository["updateLastLoginDate"]>().mockResolvedValue(undefined),
  } satisfies IUserLoginRepository;
}

describe("LoginUsecase", () => {
  it("名前とパスワードが正しい場合、トークンとプロフィールを返し、最終ログイン日時を1回更新すること", async () => {
    const repository = createRepository(await createUser());
    const usecase = new LoginUsecase(repository, testConfig);

    const result = await usecase.execute({ name: PROFILE.name, password: PASSWORD });

    const dto = result._unsafeUnwrap();
    expect(dto.value.user).toEqual(PROFILE);
    expect(dto.value.accessToken).toBeTruthy();
    expect(dto.value.refreshToken).toBeTruthy();
    expect(repository.updateLastLoginDate).toHaveBeenCalledTimes(1);
    expect(repository.updateLastLoginDate.mock.calls[0]?.[0].value).toBe(PROFILE.id);
  });

  it("ユーザーが存在しない場合、AUTHENTICATION_FAILED を返し、最終ログイン日時を更新しないこと", async () => {
    const repository = createRepository(null);
    const usecase = new LoginUsecase(repository, testConfig);

    const result = await usecase.execute({ name: PROFILE.name, password: PASSWORD });

    expect(result._unsafeUnwrapErr()).toEqual({ type: "AUTHENTICATION_FAILED" });
    expect(repository.updateLastLoginDate).not.toHaveBeenCalled();
  });

  it("パスワードが違う場合、AUTHENTICATION_FAILED を返し、最終ログイン日時を更新しないこと", async () => {
    const repository = createRepository(await createUser());
    const usecase = new LoginUsecase(repository, testConfig);

    const result = await usecase.execute({ name: PROFILE.name, password: "wrong-password" });

    expect(result._unsafeUnwrapErr()).toEqual({ type: "AUTHENTICATION_FAILED" });
    expect(repository.updateLastLoginDate).not.toHaveBeenCalled();
  });

  it("入力値が空の場合、INVALID_INPUT で違反をすべて項目名とともに返し、DB を問い合わせないこと", async () => {
    const repository = createRepository(await createUser());
    const usecase = new LoginUsecase(repository, testConfig);

    const result = await usecase.execute({ name: "", password: "" });

    expect(result._unsafeUnwrapErr()).toEqual({
      type: "INVALID_INPUT",
      errors: [
        { field: "name", error: { type: "LOGIN_ID_EMPTY" } },
        { field: "password", error: { type: "RAW_PASSWORD_EMPTY" } },
      ],
    });
    expect(repository.findUser).not.toHaveBeenCalled();
    expect(repository.updateLastLoginDate).not.toHaveBeenCalled();
  });

  it("入力した名前でユーザーを問い合わせること（ユーザー名の文字数は判定しない）", async () => {
    const repository = createRepository(null);
    const usecase = new LoginUsecase(repository, testConfig);

    await usecase.execute({ name: "ab", password: PASSWORD });

    expect(repository.findUser.mock.calls[0]?.[0].value).toBe("ab");
  });
});
