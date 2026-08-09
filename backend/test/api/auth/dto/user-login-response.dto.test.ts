import { describe, it, expect } from "vitest";
import { UserLoginResponseDto } from "../../../../src/presentation/auth/dto";
import type { UserProfile } from "../../../../src/domain/user";

describe("UserLoginResponseDto", () => {
  it("プロフィールからDTOを生成できること", () => {
    const profile: UserProfile = {
      id: "01ARZ3NDEKTSV4RRFFQ69G5FAV",
      name: "testuser",
      birthday: "19900101",
    };
    const accessToken = "test-access-token";

    const dto = new UserLoginResponseDto(profile, accessToken);

    expect(dto.value.accessToken).toBe("test-access-token");
    expect(dto.value.user.id).toBe("01ARZ3NDEKTSV4RRFFQ69G5FAV");
    expect(dto.value.user.name).toBe("testuser");
    expect(dto.value.user.birthday).toBe("19900101");
  });

  it("birthdayがnullでもDTOを生成できること", () => {
    const profile: UserProfile = {
      id: "01BX5ZZKBKACTAV9WEVGEMMVRZ",
      name: "newuser",
      birthday: null,
    };
    const accessToken = "another-access-token";

    const dto = new UserLoginResponseDto(profile, accessToken);

    expect(dto.value.accessToken).toBe("another-access-token");
    expect(dto.value.user.id).toBe("01BX5ZZKBKACTAV9WEVGEMMVRZ");
    expect(dto.value.user.name).toBe("newuser");
    expect(dto.value.user.birthday).toBeNull();
  });
});
