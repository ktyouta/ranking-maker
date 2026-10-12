import { describe, it, expect } from "vitest";
import { PublicStatus } from "./public-status";

describe("PublicStatus", () => {
  describe("create", () => {
    it.each([PublicStatus.PRIVATE, PublicStatus.PUBLIC])("許容値「%s」で生成できること", (status) => {
      expect(PublicStatus.create(status)._unsafeUnwrap().value).toBe(status);
    });

    it.each([0, 3, 1.5])("許容値以外の「%s」の場合、PUBLIC_STATUS_INVALID を返すこと", (status) => {
      expect(PublicStatus.create(status)._unsafeUnwrapErr()).toEqual({ type: "PUBLIC_STATUS_INVALID" });
    });
  });

  describe("of", () => {
    it("制約を満たす値で生成できること", () => {
      expect(PublicStatus.of(PublicStatus.PUBLIC).value).toBe(PublicStatus.PUBLIC);
    });

    it("制約を満たさない値の場合は throw すること", () => {
      expect(() => PublicStatus.of(0)).toThrow();
    });
  });
});
