import { describe, it, expect, vi } from "vitest";
import { ContentModerationRepository } from "../../../src/infrastructure/my-ranking/repository/content-moderation.repository";

describe("ContentModerationRepository", () => {
  it("廃止されたモデル(@cf/meta/llama-3-8b-instruct)を使用していないこと", async () => {
    const runMock = vi.fn().mockResolvedValue({ response: '{"inappropriateIndexes":[]}' });
    const ai = { run: runMock } as unknown as Ai;
    const repository = new ContentModerationRepository(ai);

    await repository.detectInappropriateIndexes([{ field: "タイトル", value: "テスト" }]);

    const [calledModel] = runMock.mock.calls[0];
    expect(calledModel).not.toBe("@cf/meta/llama-3-8b-instruct");
  });

  it("response_format(json_schema)を指定していないこと（モデルにより出力形式が揺れて不整合を起こすため）", async () => {
    const runMock = vi.fn().mockResolvedValue({ response: '{"inappropriateIndexes":[]}' });
    const ai = { run: runMock } as unknown as Ai;
    const repository = new ContentModerationRepository(ai);

    await repository.detectInappropriateIndexes([{ field: "タイトル", value: "テスト" }]);

    const [, options] = runMock.mock.calls[0];
    expect(options).not.toHaveProperty("response_format");
  });

  it("不適切と判定されたインデックスを返すこと", async () => {
    const runMock = vi.fn().mockResolvedValue({ response: '{"inappropriateIndexes":[1]}' });
    const ai = { run: runMock } as unknown as Ai;
    const repository = new ContentModerationRepository(ai);

    const result = await repository.detectInappropriateIndexes([
      { field: "タイトル", value: "テスト" },
      { field: "メモ", value: "不適切な内容" },
    ]);

    expect(result).toEqual([1]);
  });

  it("レスポンスに前置き・説明文が混ざっていてもJSON部分を抽出できること", async () => {
    const runMock = vi.fn().mockResolvedValue({
      response: '以下が判定結果です。\n{"inappropriateIndexes":[0]}\n以上です。',
    });
    const ai = { run: runMock } as unknown as Ai;
    const repository = new ContentModerationRepository(ai);

    const result = await repository.detectInappropriateIndexes([{ field: "タイトル", value: "テスト" }]);

    expect(result).toEqual([0]);
  });

  it("JSONが含まれない場合は空配列を返すこと", async () => {
    const runMock = vi.fn().mockResolvedValue({ response: "問題ありません" });
    const ai = { run: runMock } as unknown as Ai;
    const repository = new ContentModerationRepository(ai);

    const result = await repository.detectInappropriateIndexes([{ field: "タイトル", value: "テスト" }]);

    expect(result).toEqual([]);
  });

  it("不正なJSONの場合は例外を投げず空配列を返すこと", async () => {
    const runMock = vi.fn().mockResolvedValue({ response: '{"inappropriateIndexes":[1,]}' });
    const ai = { run: runMock } as unknown as Ai;
    const repository = new ContentModerationRepository(ai);

    const result = await repository.detectInappropriateIndexes([{ field: "タイトル", value: "テスト" }]);

    expect(result).toEqual([]);
  });

  it("responseが空の場合は空配列を返すこと", async () => {
    const runMock = vi.fn().mockResolvedValue({ response: undefined });
    const ai = { run: runMock } as unknown as Ai;
    const repository = new ContentModerationRepository(ai);

    const result = await repository.detectInappropriateIndexes([{ field: "タイトル", value: "テスト" }]);

    expect(result).toEqual([]);
  });
});
