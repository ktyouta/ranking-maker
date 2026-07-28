import { describe, it, expect } from "vitest";
import {
  FrontUserEntity,
  FrontUserLoginEntity,
} from "../../../../src/api/front-user/entity";
import {
  FrontUserId,
  FrontUserName,
  FrontUserBirthday,
  FrontUserSalt,
  FrontUserPassword,
  Pepper,
} from "../../../../src/domain";

describe("FrontUserEntity", () => {
  it("エンティティを生成できること", () => {
    const userId = FrontUserId.of(1);
    const userName = new FrontUserName("testuser");
    const userBirthday = new FrontUserBirthday("19900101");

    const entity = new FrontUserEntity(userId, userName, userBirthday);

    expect(entity.frontUserId).toBe(1);
    expect(entity.frontUserName).toBe("testuser");
    expect(entity.frontUserBirthday).toBe("19900101");
  });
});

describe("FrontUserLoginEntity", () => {
  it("エンティティを生成できること", async () => {
    const userId = FrontUserId.of(1);
    const userName = new FrontUserName("testuser");
    const salt = FrontUserSalt.generate();
    const pepper = new Pepper("test-pepper");
    const password = await FrontUserPassword.hash("password123", salt, pepper);

    const entity = new FrontUserLoginEntity(userId, userName, password, salt);

    expect(entity.frontUserId).toBe(1);
    expect(entity.frontUserName).toBe("testuser");
    expect(entity.salt).toBe(salt.value);
    expect(entity.frontUserPassword).toBe(password.value);
  });
});
