import { describe, it, expect } from "vitest";
import { NewPassword, Pepper, RawPassword, UserAggregate, UserBirthday, UserName, UserPassword, UserSalt, UserTheme } from "../..";

describe("UserAggregate", () => {
  const pepper = new Pepper("test-pepper");

  async function createEntity() {
    return UserAggregate.create({
      name: UserName.of("testuser"),
      birthday: UserBirthday.of("19900101"),
      password: NewPassword.create("password123")._unsafeUnwrap(),
      pepper,
    });
  }

  function reconstructEntity(deleteFlg: boolean) {
    return UserAggregate.reconstruct({
      id: "01ARZ3NDEKTSV4RRFFQ69G5FAV",
      name: "testuser",
      birthday: "19900101",
      theme: "lavender",
      loginCredentialId: "01BX5ZZKBKACTAV9WEVGEMMVRZ",
      loginId: "testuser",
      passwordHash: "hash",
      salt: "salt",
      deleteFlg,
    });
  }

  describe("create", () => {
    it("ユーザー名をログインIDとし、テーマは既定値、未削除で生成されること", async () => {
      const snapshot = (await createEntity()).toSnapshot();

      expect(snapshot.name).toBe("testuser");
      expect(snapshot.birthday).toBe("19900101");
      expect(snapshot.loginId).toBe("testuser");
      expect(snapshot.theme).toBe(UserTheme.default().value);
      expect(snapshot.deleteFlg).toBe(false);
    });

    it("パスワードを生成したソルトとペッパーでハッシュ化して保持すること", async () => {
      const snapshot = (await createEntity()).toSnapshot();

      const expectedHash = await UserPassword.hash(RawPassword.of("password123"), UserSalt.of(snapshot.salt), pepper);
      expect(snapshot.passwordHash).toBe(expectedHash.value);
    });
  });

  describe("reconstruct", () => {
    it("永続化済みの値をそのまま復元できること", () => {
      const snapshot = reconstructEntity(false).toSnapshot();

      expect(snapshot).toEqual({
        id: "01ARZ3NDEKTSV4RRFFQ69G5FAV",
        name: "testuser",
        birthday: "19900101",
        theme: "lavender",
        loginCredentialId: "01BX5ZZKBKACTAV9WEVGEMMVRZ",
        loginId: "testuser",
        passwordHash: "hash",
        salt: "salt",
        deleteFlg: false,
      });
    });
  });

  describe("updateUser", () => {
    it("ユーザー名・生年月日・テーマを変更し、ログインIDもユーザー名に合わせて変更すること", async () => {
      const entity = await createEntity();
      const before = entity.toSnapshot();

      entity.updateUser({
        name: UserName.of("newuser"),
        birthday: UserBirthday.of("20000202"),
        theme: UserTheme.of("dark"),
      });

      const after = entity.toSnapshot();
      expect(after.name).toBe("newuser");
      expect(after.birthday).toBe("20000202");
      expect(after.theme).toBe("dark");
      expect(after.loginId).toBe("newuser");
      expect(after.id).toBe(before.id);
      expect(after.passwordHash).toBe(before.passwordHash);
    });

    it("削除済みユーザーの場合は例外を投げること", () => {
      const entity = reconstructEntity(true);

      expect(() => entity.updateUser({
        name: UserName.of("newuser"),
        birthday: UserBirthday.of("20000202"),
        theme: UserTheme.of("dark"),
      })).toThrow();
    });
  });

  describe("changePassword", () => {
    it("現在のパスワードが一致する場合、新しいパスワードのハッシュに変更すること", async () => {
      const entity = await createEntity();

      const result = await entity.changePassword(
        RawPassword.of("password123"),
        NewPassword.create("new-password")._unsafeUnwrap(),
        pepper,
      );

      expect(result.isOk()).toBe(true);
      const snapshot = entity.toSnapshot();
      const expectedHash = await UserPassword.hash(RawPassword.of("new-password"), UserSalt.of(snapshot.salt), pepper);
      expect(snapshot.passwordHash).toBe(expectedHash.value);
    });

    it("現在のパスワードが一致しない場合、エラーを返しパスワードを変更しないこと", async () => {
      const entity = await createEntity();
      const before = entity.toSnapshot();

      const result = await entity.changePassword(
        RawPassword.of("wrong-password"),
        NewPassword.create("new-password")._unsafeUnwrap(),
        pepper,
      );

      expect(result._unsafeUnwrapErr()).toEqual({ type: "CURRENT_PASSWORD_MISMATCH" });
      expect(entity.toSnapshot().passwordHash).toBe(before.passwordHash);
    });

    it("削除済みユーザーの場合は例外を投げること", async () => {
      const entity = reconstructEntity(true);

      await expect(entity.changePassword(
        RawPassword.of("password123"),
        NewPassword.create("new-password")._unsafeUnwrap(),
        pepper,
      )).rejects.toThrow();
    });
  });
});
