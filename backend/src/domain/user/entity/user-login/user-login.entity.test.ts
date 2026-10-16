import { describe, it, expect } from "vitest";
import {
  UserLoginEntity,
  UserId,
  UserName,
  UserSalt,
  UserPassword,
  Pepper,
  RawPassword,
  NewPassword,
} from "../../..";

describe("UserLoginEntity", () => {
  const pepper = new Pepper("test-pepper");

  it("エンティティを生成できること", async () => {
    const loginCredentialId = UserId.of("01ARZ3NDEKTSV4RRFFQ69G5FAV");
    const userId = UserId.of("01BX5ZZKBKACTAV9WEVGEMMVRZ");
    const loginId = UserName.of("testuser");
    const salt = UserSalt.generate();
    const password = await UserPassword.hash("password123", salt, pepper);

    const entity = new UserLoginEntity(loginCredentialId, userId, loginId, password, salt);

    expect(entity.loginCredentialId).toBe(loginCredentialId.value);
    expect(entity.userId).toBe(userId.value);
    expect(entity.loginId).toBe("testuser");
    expect(entity.passwordHash).toBe(password.value);
    expect(entity.salt).toBe(salt.value);
  });

  it("verifyPasswordで正しいパスワードを検証できること", async () => {
    const salt = UserSalt.generate();
    const password = await UserPassword.hash("password123", salt, pepper);
    const entity = new UserLoginEntity(
      UserId.of("01ARZ3NDEKTSV4RRFFQ69G5FAV"),
      UserId.of("01BX5ZZKBKACTAV9WEVGEMMVRZ"),
      UserName.of("testuser"),
      password,
      salt
    );

    expect(await entity.verifyPassword(RawPassword.create("password123")._unsafeUnwrap(), pepper)).toBe(true);
  });

  it("verifyPasswordで誤ったパスワードを拒否すること", async () => {
    const salt = UserSalt.generate();
    const password = await UserPassword.hash("password123", salt, pepper);
    const entity = new UserLoginEntity(
      UserId.of("01ARZ3NDEKTSV4RRFFQ69G5FAV"),
      UserId.of("01BX5ZZKBKACTAV9WEVGEMMVRZ"),
      UserName.of("testuser"),
      password,
      salt
    );

    expect(await entity.verifyPassword(RawPassword.create("wrong-password")._unsafeUnwrap(), pepper)).toBe(false);
  });

  describe("changePassword", () => {
    async function createEntity() {
      const salt = UserSalt.generate();
      const password = await UserPassword.hash("password123", salt, pepper);
      return new UserLoginEntity(
        UserId.of("01ARZ3NDEKTSV4RRFFQ69G5FAV"),
        UserId.of("01BX5ZZKBKACTAV9WEVGEMMVRZ"),
        UserName.of("testuser"),
        password,
        salt
      );
    }

    it("現在のパスワードが一致する場合、同じソルトでハッシュ化した新しいパスワードに置き換えること", async () => {
      const entity = await createEntity();

      const result = await entity.changePassword(
        RawPassword.create("password123")._unsafeUnwrap(),
        NewPassword.create("new-password")._unsafeUnwrap(),
        pepper
      );

      expect(result.isOk()).toBe(true);
      const expectedHash = await UserPassword.hash("new-password", UserSalt.of(entity.salt), pepper);
      expect(entity.passwordHash).toBe(expectedHash.value);
      expect(await entity.verifyPassword(RawPassword.create("new-password")._unsafeUnwrap(), pepper)).toBe(true);
    });

    it("現在のパスワードが一致しない場合、CURRENT_PASSWORD_MISMATCH を返し、パスワードを変更しないこと", async () => {
      const entity = await createEntity();
      const beforeHash = entity.passwordHash;

      const result = await entity.changePassword(
        RawPassword.create("wrong-password")._unsafeUnwrap(),
        NewPassword.create("new-password")._unsafeUnwrap(),
        pepper
      );

      expect(result._unsafeUnwrapErr()).toEqual({ type: "CURRENT_PASSWORD_MISMATCH" });
      expect(entity.passwordHash).toBe(beforeHash);
    });
  });
});
