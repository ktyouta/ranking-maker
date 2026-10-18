import { describe, it, expect } from "vitest";
import { LoginResultDto } from "..";
import { AccessToken, RefreshToken, UserAggregate } from "../../../../domain/user";
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

describe("LoginResultDto", () => {
  it("集約とトークンからDTOを生成できること", async () => {
    const aggregate = UserAggregate.reconstruct({
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
    const accessToken = await AccessToken.create(aggregate.id, testConfig);
    const refreshToken = await RefreshToken.create(aggregate.id, testConfig);

    const dto = new LoginResultDto(aggregate, accessToken, refreshToken);

    expect(dto.value.accessToken).toBe(accessToken.token);
    expect(dto.value.refreshToken).toBe(refreshToken.value);
    expect(dto.value.user.id).toBe("01ARZ3NDEKTSV4RRFFQ69G5FAV");
    expect(dto.value.user.name).toBe("testuser");
    expect(dto.value.user.birthday).toBe("19900101");
    expect(dto.value.user.theme).toBe("lavender");
  });
});
