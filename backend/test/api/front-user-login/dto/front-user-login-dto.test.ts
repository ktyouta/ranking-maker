import { describe, it, expect } from "vitest";
import { FrontUserLoginResponseDto } from "../../../../src/api/front-user-login/dto";
import type { FrontUserMaster } from "../../../../src/infrastructure/db";

describe("FrontUserLoginResponseDto", () => {
  it("ユーザー情報からDTOを生成できること", () => {
    const userInfo: FrontUserMaster = {
      id: 1,
      name: "testuser",
      birthday: "19900101",
      lastLoginDate: "2024-01-01T00:00:00.000Z",
      deleteFlg: "0",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };
    const accessToken = "test-access-token";

    const dto = new FrontUserLoginResponseDto(userInfo, accessToken);

    expect(dto.value.accessToken).toBe("test-access-token");
    expect(dto.value.user.id).toBe(1);
    expect(dto.value.user.name).toBe("testuser");
    expect(dto.value.user.birthday).toBe("19900101");
  });

  it("lastLoginDateがnullでもDTOを生成できること", () => {
    const userInfo: FrontUserMaster = {
      id: 2,
      name: "newuser",
      birthday: "19950515",
      lastLoginDate: null,
      deleteFlg: "0",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };
    const accessToken = "another-access-token";

    const dto = new FrontUserLoginResponseDto(userInfo, accessToken);

    expect(dto.value.accessToken).toBe("another-access-token");
    expect(dto.value.user.id).toBe(2);
    expect(dto.value.user.name).toBe("newuser");
    expect(dto.value.user.birthday).toBe("19950515");
  });
});
