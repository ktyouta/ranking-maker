import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { BulkRestoreMyRankingUsecase } from "../../../application";
import type { BulkRestoreMyRankingResultType } from "../../../application";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { RankingId, RankingTitleUniquenessDomainService, UserId } from "../../../domain";
import { BulkRestoreMyRankingRepository, RankingTitleUniquenessRepository } from "../../../infrastructure";
import { authMiddleware } from "../../../middleware";
import type { AppEnv } from "../../../types";
import { formatZodErrors } from "../../../util";
import { BulkRestoreMyRankingSchema } from "../schema";

/**
 * 復元件数・同名ランキングによるスキップ件数から通知文言を作成する
 * @param result 一括復元の結果
 * @returns 通知文言
 */
function toMessage({ restoreCount, skippedCount }: BulkRestoreMyRankingResultType): string {
  if (restoreCount === 0 && skippedCount === 0) {
    return "復元対象のランキングが見つかりませんでした。";
  }
  if (skippedCount === 0) {
    return `${restoreCount}件を復元しました。`;
  }
  return `${restoreCount}件を復元しました（${skippedCount}件は同名のランキングが存在するためスキップされました）。`;
}

/**
 * ランキング一括復元
 */
const bulkRestoreMyRanking = new Hono<AppEnv>().post(API_ENDPOINT.MY_RANKING_BULK_RESTORE,
  authMiddleware,
  zValidator("json", BulkRestoreMyRankingSchema, (result, c) => {
    if (!result.success) {
      return c.json({ message: "リクエストが不正です。", data: formatZodErrors(result.error) }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
    }
  }),
  async (c) => {
    const db = c.get('db');
    const repository = new BulkRestoreMyRankingRepository(db);
    const user = c.get("user");
    if (!user) {
      return c.json({ message: "認証エラー" }, HTTP_STATUS.UNAUTHORIZED);
    }
    const userId = UserId.of(user.userId.value);
    const { ids } = c.req.valid("json");
    const rankingIds = ids.map((id) => RankingId.of(id));
    const uniquenessService = new RankingTitleUniquenessDomainService(new RankingTitleUniquenessRepository(db));
    const usecase = new BulkRestoreMyRankingUsecase(repository, uniquenessService);

    const { value: result } = await usecase.execute(userId, rankingIds);

    return c.json({
      message: toMessage(result),
      restoreCount: result.restoreCount,
      skippedCount: result.skippedCount,
    }, HTTP_STATUS.OK);
  });

export { bulkRestoreMyRanking };
