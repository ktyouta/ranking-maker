import { Hono } from "hono";
import { BulkRestoreMyRankingUsecase } from "../../../../application";
import type { BulkRestoreMyRankingResultType } from "../../../../application";
import { API_ENDPOINT, HTTP_STATUS } from "../../../../constant";
import { RankingTitleUniquenessDomainService, UserId } from "../../../../domain";
import { BulkRestoreMyRankingRepository, RankingTitleUniquenessRepository } from "../../../../infrastructure";
import { authMiddleware, validatorMiddleware } from "../../../../middleware";
import type { AppEnv } from "../../../../types";
import { toInputErrorMessage } from "../../error-message";
import { BulkRestoreMyRankingSchema } from "../../schema";

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
  validatorMiddleware("json", BulkRestoreMyRankingSchema),
  async (c) => {
    const db = c.get('db');
    const repository = new BulkRestoreMyRankingRepository(db);
    const user = c.get("user");
    if (!user) {
      return c.json({ message: "認証エラー" }, HTTP_STATUS.UNAUTHORIZED);
    }
    const userId = UserId.of(user.userId.value);
    const { ids } = c.req.valid("json");
    const uniquenessService = new RankingTitleUniquenessDomainService(new RankingTitleUniquenessRepository(db));
    const usecase = new BulkRestoreMyRankingUsecase(repository, uniquenessService);

    const result = await usecase.execute({ userId, rankingIds: ids });

    return result.match(
      // 成功
      ({ value }) => c.json({
        message: toMessage(value),
        restoreCount: value.restoreCount,
        skippedCount: value.skippedCount,
      }, HTTP_STATUS.OK),
      // 失敗
      (error) => {
        switch (error.type) {
          case "INVALID_INPUT":
            return c.json({ message: "入力エラー", data: error.errors.map((e) => ({ field: e.field, message: toInputErrorMessage(e.error) })) }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
          default: {
            // 全てのエラー種別を網羅していることを型で保証する
            error.type satisfies never;
            return c.json({ message: "サーバーエラー" }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
          }
        }
      },
    );
  });

export { bulkRestoreMyRanking };
