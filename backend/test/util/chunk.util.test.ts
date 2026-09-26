import { describe, it, expect } from "vitest";
import { chunk } from "../../src/util";

describe("chunk", () => {
  it("指定件数ごとに分割し、端数は最後にまとめること", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("空配列は空配列を返すこと", () => {
    expect(chunk([], 3)).toEqual([]);
  });

  it("分割件数が0以下の場合はエラーになること", () => {
    expect(() => chunk([1], 0)).toThrow();
  });
});
