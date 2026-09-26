import { drizzle } from "drizzle-orm/d1";
import { env } from "cloudflare:test";
import { eq } from "drizzle-orm";
import { ulid } from "ulid";
import { describe, expect, it } from "vitest";
import { PublicStatus, RankingIcon, RankingMemo, RankingTagEntity, RankingTagId, RankingTitle, TagAggregate, TagId, TagName, TagUsageDomainService } from "../../../../src/domain/my-ranking";
import { RankingId, UserId } from "../../../../src/domain/shared";
import * as schema from "../../../../src/infrastructure/db/schema";
import { publicStatusMaster, rankingMaster, rankingTagMaster, tagMaster, userMaster } from "../../../../src/infrastructure/db/schema";
import { TagUsageRepository } from "../../../../src/infrastructure/my-ranking/repository/tag-usage.repository";
import { UpdateMyRankingRepository } from "../../../../src/infrastructure/my-ranking/repository/update-my-ranking.repository";

describe("UpdateMyRankingRepository", () => {

    it("findRanking→update→updateRanking: タグ付けを全件入れ替え、手放したタグのうち未使用と判定されたものだけを削除すること", async () => {
        const db = drizzle(env.DB, { schema });
        const now = new Date().toISOString();
        const publicStatusId = 1;

        const userId = ulid();
        const otherUserId = ulid();
        const rankingId = ulid();
        const trashedRankingId = ulid();
        const removedTagId = ulid();
        const keptTagId = ulid();
        const trashedOnlyTagId = ulid();
        const sharedWithTrashTagId = ulid();
        const unrelatedTagId = ulid();
        const otherUserTagId = ulid();

        await db.insert(userMaster).values([
            { id: userId, name: `test-user-${userId}`, createdAt: now, updatedAt: now },
            { id: otherUserId, name: `test-user-${otherUserId}`, createdAt: now, updatedAt: now },
        ]);
        await db.insert(publicStatusMaster).values({
            id: publicStatusId,
            name: `test-status-${publicStatusId}`,
            createdAt: now,
            updatedAt: now,
        }).onConflictDoNothing();
        await db.insert(rankingMaster).values([
            { id: rankingId, userId, title: `test-ranking-${rankingId}`, publicStatus: publicStatusId, isFavorite: true, createdAt: now, updatedAt: now },
            { id: trashedRankingId, userId, title: `test-ranking-${trashedRankingId}`, publicStatus: publicStatusId, deleteFlg: true, createdAt: now, updatedAt: now },
        ]);
        await db.insert(tagMaster).values([
            { id: removedTagId, userId, name: "外すタグ", createdAt: now, updatedAt: now },
            { id: keptTagId, userId, name: "残すタグ", createdAt: now, updatedAt: now },
            { id: trashedOnlyTagId, userId, name: "ゴミ箱のみのタグ", createdAt: now, updatedAt: now },
            { id: sharedWithTrashTagId, userId, name: "ゴミ箱のランキングと共有するタグ", createdAt: now, updatedAt: now },
            { id: unrelatedTagId, userId, name: "このランキングと無関係のタグ", createdAt: now, updatedAt: now },
            { id: otherUserTagId, userId: otherUserId, name: "他ユーザーのタグ", createdAt: now, updatedAt: now },
        ]);
        await db.insert(rankingTagMaster).values([
            { id: ulid(), rankingId, tagId: removedTagId, userId, createdAt: now, updatedAt: now },
            { id: ulid(), rankingId, tagId: removedTagId, userId, deleteFlg: true, createdAt: now, updatedAt: now },
            { id: ulid(), rankingId, tagId: keptTagId, userId, createdAt: now, updatedAt: now },
            { id: ulid(), rankingId, tagId: sharedWithTrashTagId, userId, createdAt: now, updatedAt: now },
            { id: ulid(), rankingId: trashedRankingId, tagId: trashedOnlyTagId, userId, deleteFlg: true, createdAt: now, updatedAt: now },
            { id: ulid(), rankingId: trashedRankingId, tagId: sharedWithTrashTagId, userId, deleteFlg: true, createdAt: now, updatedAt: now },
        ]);

        const repository = new UpdateMyRankingRepository(db);
        const currentRanking = await repository.findRanking(UserId.of(userId), RankingId.of(rankingId));
        if (!currentRanking) {
            throw new Error("unexpected null");
        }
        expect(currentRanking.rankingTagEntityList.map((e) => e.tagId).sort()).toEqual([removedTagId, keptTagId, sharedWithTrashTagId].sort());

        const newTag = TagAggregate.create({ userId: UserId.of(userId), tagName: new TagName("新規タグ") });
        const updateResult = currentRanking.update({
            rankingTitle: new RankingTitle("更新後のランキング"),
            publicStatus: new PublicStatus(publicStatusId),
            icon: new RankingIcon(1),
            memo: new RankingMemo(""),
            rankingOrderEntityList: [],
            rankingTagEntityList: [new RankingTagEntity(RankingTagId.generate(), TagId.of(keptTagId), false), new RankingTagEntity(RankingTagId.generate(), TagId.of(newTag.id), false)],
        });
        if (updateResult.isErr()) {
            throw new Error("unexpected error");
        }
        const { ranking, releasedTagIds } = updateResult.value;
        expect(ranking.isFavorite()).toBe(true);
        expect(releasedTagIds.map((e) => e.value).sort()).toEqual([removedTagId, sharedWithTrashTagId].sort());

        const tagUsageService = new TagUsageDomainService(new TagUsageRepository(db));
        const unusedTagIds = await tagUsageService.findUnused({ userId: UserId.of(userId), rankingId: RankingId.of(rankingId), releasedTagIds });
        expect(unusedTagIds.map((e) => e.value)).toEqual([removedTagId]);

        await repository.updateRanking(ranking, [newTag], unusedTagIds);

        const links = await db.select().from(rankingTagMaster).where(eq(rankingTagMaster.rankingId, rankingId));
        expect(links.map((e) => e.tagId).sort()).toEqual([keptTagId, newTag.id].sort());
        expect(links.every((e) => !e.deleteFlg)).toBe(true);

        const tags = await db.select({ id: tagMaster.id }).from(tagMaster);
        expect(tags.map((e) => e.id).sort()).toEqual([keptTagId, newTag.id, trashedOnlyTagId, sharedWithTrashTagId, unrelatedTagId, otherUserTagId].sort());
    });
});
