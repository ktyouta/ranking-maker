import { describe, expect, it } from "vitest";
import { RankingId } from "./ranking-id";

describe("RankingId", () => {
  describe("fromInput", () => {
    it("空でない場合は指定したIDを保持すること", () => {
      expect(RankingId.fromInput("ranking-1")._unsafeUnwrap().value).toBe("ranking-1");
    });

    it("空文字の場合は RANKING_ID_EMPTY を返すこと", () => {
      expect(RankingId.fromInput("")._unsafeUnwrapErr()).toEqual({ type: "RANKING_ID_EMPTY" });
    });
  });

  describe("of", () => {
    it("空でない場合は指定したIDを保持すること", () => {
      expect(RankingId.of("ranking-1").value).toBe("ranking-1");
    });

    it("空文字の場合は例外を投げること", () => {
      expect(() => RankingId.of("")).toThrow("ランキングIDが不正です。type:RANKING_ID_EMPTY");
    });
  });

  it("create で生成したIDは空でないこと", () => {
    expect(RankingId.create().value).not.toBe("");
  });
});
