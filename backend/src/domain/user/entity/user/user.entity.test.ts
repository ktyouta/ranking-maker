import { describe, it, expect } from "vitest";
import { UserEntity, UserId, UserName, UserBirthday, UserTheme } from "../../..";

describe("UserEntity", () => {
  it("エンティティを生成できること", () => {
    const userId = UserId.of("01ARZ3NDEKTSV4RRFFQ69G5FAV");
    const userName = UserName.of("testuser");
    const userBirthday = UserBirthday.create("19900101")._unsafeUnwrap();
    const theme = UserTheme.default();

    const entity = new UserEntity(userId, userName, userBirthday, theme);

    expect(entity.userId).toBe("01ARZ3NDEKTSV4RRFFQ69G5FAV");
    expect(entity.userName).toBe("testuser");
    expect(entity.userBirthday).toBe("19900101");
    expect(entity.userTheme).toBe("lavender");
  });

  it("changeProfile でユーザー名・生年月日を変更し、ID・テーマは変更しないこと", () => {
    const entity = new UserEntity(UserId.of("01ARZ3NDEKTSV4RRFFQ69G5FAV"), UserName.of("testuser"), UserBirthday.of("19900101"), UserTheme.default());

    entity.changeProfile(UserName.of("renamed"), UserBirthday.of("20000101"));

    expect(entity.userId).toBe("01ARZ3NDEKTSV4RRFFQ69G5FAV");
    expect(entity.userName).toBe("renamed");
    expect(entity.userBirthday).toBe("20000101");
    expect(entity.userTheme).toBe("lavender");
  });
});
