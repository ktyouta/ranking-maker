import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("PATCH /api/v1/my-ranking/:rankingId", () => {

    it("rankingId を含むパスがルーティングされる（未認証時は401になる。404にならない）", async () => {
        const res = await SELF.fetch("http://localhost/api/v1/my-ranking/test-ranking-id", {
            method: "PATCH",
            body: JSON.stringify({}),
            headers: { "Content-Type": "application/json" },
        });

        expect(res.status).not.toBe(404);
        expect(res.status).toBe(401);
    });
});
