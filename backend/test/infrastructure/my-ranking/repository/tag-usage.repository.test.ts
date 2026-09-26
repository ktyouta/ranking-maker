import { drizzle } from "drizzle-orm/d1";
import { env } from "cloudflare:test";
import { ulid } from "ulid";
import { describe, expect, it } from "vitest";
import { TagId } from "../../../../src/domain/my-ranking";
import { RankingId, UserId } from "../../../../src/domain/shared";
import * as schema from "../../../../src/infrastructure/db/schema";
import { publicStatusMaster, rankingMaster, rankingTagMaster, tagMaster, userMaster } from "../../../../src/infrastructure/db/schema";
import { TagUsageRepository } from "../../../../src/infrastructure/my-ranking/repository/tag-usage.repository";

describe("TagUsageRepository", () => {

    it("findReferencedTagIds: 指定ランキング以外（ゴミ箱内を含む）から参照されているタグだけを返すこと", async () => {
        const db = drizzle(env.DB, { schema });
        const now = new Date().toISOString();
        const publicStatusId = 1;
        const userId = ulid();
        const rankingId = ulid();
        const otherRankingId = ulid();
        const trashedRankingId = ulid();
        const onlyTagId = ulid();
        const sharedTagId = ulid();
        const trashSharedTagId = ulid();

        await db.insert(userMaster).values({ id: userId, name: `test-user-${userId}`, createdAt: now, updatedAt: now });
        await db.insert(publicStatusMaster).values({
            id: publicStatusId,
            name: `test-status-${publicStatusId}`,
            createdAt: now,
            updatedAt: now,
        }).onConflictDoNothing();
        await db.insert(rankingMaster).values([
            { id: rankingId, userId, title: `test-ranking-${rankingId}`, publicStatus: publicStatusId, createdAt: now, updatedAt: now },
            { id: otherRankingId, userId, title: `test-ranking-${otherRankingId}`, publicStatus: publicStatusId, createdAt: now, updatedAt: now },
            { id: trashedRankingId, userId, title: `test-ranking-${trashedRankingId}`, publicStatus: publicStatusId, deleteFlg: true, createdAt: now, updatedAt: now },
        ]);
        await db.insert(tagMaster).values([
            { id: onlyTagId, userId, name: "このランキングだけのタグ", createdAt: now, updatedAt: now },
            { id: sharedTagId, userId, name: "共有タグ", createdAt: now, updatedAt: now },
            { id: trashSharedTagId, userId, name: "ゴミ箱と共有するタグ", createdAt: now, updatedAt: now },
        ]);
        await db.insert(rankingTagMaster).values([
            { id: ulid(), rankingId, tagId: onlyTagId, userId, createdAt: now, updatedAt: now },
            { id: ulid(), rankingId, tagId: sharedTagId, userId, createdAt: now, updatedAt: now },
            { id: ulid(), rankingId, tagId: trashSharedTagId, userId, createdAt: now, updatedAt: now },
            { id: ulid(), rankingId: otherRankingId, tagId: sharedTagId, userId, createdAt: now, updatedAt: now },
            { id: ulid(), rankingId: trashedRankingId, tagId: trashSharedTagId, userId, deleteFlg: true, createdAt: now, updatedAt: now },
        ]);

        const repository = new TagUsageRepository(db);
        const result = await repository.findReferencedTagIds(
            UserId.of(userId),
            RankingId.of(rankingId),
            [TagId.of(onlyTagId), TagId.of(sharedTagId), TagId.of(trashSharedTagId)],
        );

        expect(result.map((e) => e.tagId).sort()).toEqual([sharedTagId, trashSharedTagId].sort());
    });
});
