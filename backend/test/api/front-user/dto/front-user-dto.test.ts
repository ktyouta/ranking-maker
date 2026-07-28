import { describe, it, expect } from "vitest";
import { FrontUserEntity } from "../../../../src/api/front-user/entity";
import { CreateFrontUserResponseDto } from "../../../../src/api/front-user/dto";
import {
  FrontUserId,
  FrontUserName,
  FrontUserBirthday,
} from "../../../../src/domain";

describe("CreateFrontUserResponseDto", () => {
  it("エンティティからDTOを生成できること", () => {
    const userId = FrontUserId.of(1);
    const userName = new FrontUserName("testuser");
    const userBirthday = new FrontUserBirthday("19900101");
    const entity = new FrontUserEntity(userId, userName, userBirthday);
    const accessToken = "test-access-token";

    const dto = new CreateFrontUserResponseDto(entity, accessToken);

    expect(dto.value.accessToken).toBe("test-access-token");
    expect(dto.value.user.id).toBe(1);
    expect(dto.value.user.name).toBe("testuser");
    expect(dto.value.user.birthday).toBe("19900101");
  });
});
