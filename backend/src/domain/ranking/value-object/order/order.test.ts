import { describe, it, expect } from "vitest";
import { Order } from "./order";

describe("Order", () => {
  describe("create", () => {
    it.each([Order.MIN, 10])("MIN 以上の整数「%s」で生成できること", (order) => {
      expect(Order.create(order)._unsafeUnwrap().value).toBe(order);
    });

    it.each([0, -1, 1.5, NaN])("「%s」の場合、ORDER_INVALID を MIN とともに返すこと", (order) => {
      expect(Order.create(order)._unsafeUnwrapErr()).toEqual({ type: "ORDER_INVALID", min: Order.MIN });
    });
  });

  describe("of", () => {
    it("制約を満たす値で生成できること", () => {
      expect(Order.of(1).value).toBe(1);
    });

    it("制約を満たさない値の場合は throw すること", () => {
      expect(() => Order.of(0)).toThrow();
    });
  });
});
