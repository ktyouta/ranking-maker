import { drizzle } from "drizzle-orm/d1";
import { env } from "cloudflare:test";
import { ulid } from "ulid";
import { describe, expect, it } from "vitest";
import { UserId } from "../../../../domain/shared";
import type { Database } from "../../../db";
import * as schema from "../../../db/schema/schema";
import { publicStatusMaster, rankingMaster, rankingTagMaster, tagMaster, userMaster } from "../../../db/schema/schema";
import { GetTrashFilterTagsRepository } from "./get-trash-filter-tags.repository";

/**
 * ユーザー・ランキング・タグを登録する
 * ゴミ箱のランキングは、論理削除のカスケードに合わせてタグ付けも deleteFlg=true で登録する
 */
async function seedTags(db: Database, rankings: { isTrashed: boolean; tags: string[] }[]) {
    const now = new Date().toISOString();
    const userId = ulid();
    const publicStatusId = 1;

    await db.insert(userMaster).values({ id: userId, name: `test-user-${userId}`, createdAt: now, updatedAt: now });
    await db.insert(publicStatusMaster).values({
        id: publicStatusId,
        name: `test-status-${publicStatusId}`,
        createdAt: now,
        updatedAt: now,
    }).onConflictDoNothing();

    // タグ名 → タグID（同じユーザー内でタグ名は一意）
    const tagIds = new Map<string, string>();
    for (const ranking of rankings) {
        const rankingId = ulid();
        await db.insert(rankingMaster).values({
            id: rankingId,
            userId,
            title: `test-ranking-${rankingId}`,
            publicStatus: publicStatusId,
            deleteFlg: ranking.isTrashed,
            createdAt: now,
            updatedAt: now,
        });
        for (const tagName of ranking.tags) {
            let tagId = tagIds.get(tagName);
            if (!tagId) {
                tagId = ulid();
                tagIds.set(tagName, tagId);
                await db.insert(tagMaster).values({ id: tagId, userId, name: tagName, createdAt: now, updatedAt: now });
            }
            await db.insert(rankingTagMaster).values({ id: ulid(), rankingId, tagId, userId, deleteFlg: ranking.isTrashed, createdAt: now, updatedAt: now });
        }
    }
    return UserId.of(userId);
}

describe("GetTrashFilterTagsRepository", () => {

    it("findTags: ゴミ箱のランキングに付いているタグだけがname昇順で返る", async () => {
        const db = drizzle(env.DB, { schema });
        const userId = await seedTags(db, [
            { isTrashed: false, tags: ["tag-live", "tag-both"] },
            { isTrashed: true, tags: ["tag-trashed", "tag-both"] },
        ]);

        const repository = new GetTrashFilterTagsRepository(db);
        const result = await repository.findTags(userId);

        expect(result.map((e) => e.name)).toEqual(["tag-both", "tag-trashed"]);
    });

    it("findTags: 他ユーザーのタグは返らない", async () => {
        const db = drizzle(env.DB, { schema });
        const userId = await seedTags(db, [{ isTrashed: true, tags: ["tag-mine"] }]);
        await seedTags(db, [{ isTrashed: true, tags: ["tag-other"] }]);

        const repository = new GetTrashFilterTagsRepository(db);
        const result = await repository.findTags(userId);

        expect(result.map((e) => e.name)).toEqual(["tag-mine"]);
    });
});
