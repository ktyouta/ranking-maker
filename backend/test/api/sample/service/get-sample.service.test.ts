import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetSampleEntity } from "../../../../src/api/sample/entity";
import { GetSampleService } from "../../../../src/api/sample/service";
import type { IGetSampleRepository } from "../../../../src/api/sample/repository";

describe("GetSampleService (get)", () => {
  let mockRepository: IGetSampleRepository;
  let service: GetSampleService;

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
    };
    service = new GetSampleService(mockRepository);
  });

  it("findById - 存在する場合にエンティティを返すこと", async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue({
      id: 1,
      name: "テスト",
      description: "説明",
      deleteFlg: "0",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });

    const result = await service.findById(1);

    expect(result).toBeInstanceOf(GetSampleEntity);
    expect(result?.id).toBe(1);
  });

  it("findById - 存在しない場合にnullを返すこと", async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(undefined);

    const result = await service.findById(999);

    expect(result).toBeNull();
  });
});
