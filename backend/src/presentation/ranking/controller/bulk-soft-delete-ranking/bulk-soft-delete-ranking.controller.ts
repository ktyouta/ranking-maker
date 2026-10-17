import { Hono } from "hono";
import { BulkSoftDeleteRankingUsecase } from "../../../../application";
import type { BulkSoftDeleteRankingResultType } from "../../../../application";
import { API_ENDPOINT, HTTP_STATUS } from "../../../../constant";
import { UserId } from "../../../../domain";
import { BulkSoftDeleteRankingRepository } from "../../../../infrastructure";
import { authMiddleware, validatorMiddleware } from "../../../../middleware";
import type { AppEnv } from "../../../../types";
import { toInputErrorMessage } from "../../error-message";
import { BulkSoftDeleteRankingSchema } from "../../schema";

/**
 * 削除件数・お気に入りによるスキップ件数から通知文言を作成する
 * @param result 一括削除の結果
 * @returns 通知文言
 */
function toMessage({ deletedCount, skippedCount }: BulkSoftDeleteRankingResultType): string {
  if (deletedCount === 0 && skippedCount === 0) {
    return "削除対象のランキングが見つかりませんでした。";
  }
  if (deletedCount === 0) {
    return "選択したランキングはすべてお気に入りのため削除できませんでした。";
  }
  if (skippedCount === 0) {
    return `${deletedCount}件をゴミ箱に移動しました。`;
  }
  return `${deletedCount}件をゴミ箱に移動しました（${skippedCount}件はお気に入りのためスキップされました）。`;
}

/**
 * ランキング一括削除(論理)
 */
const bulkSoftDeleteRanking = new Hono<AppEnv>().post(API_ENDPOINT.RANKING_BULK_DELETE,
  authMiddleware,
  validatorMiddleware("json", BulkSoftDeleteRankingSchema),
  async (c) => {
    const db = c.get('db');
    const repository = new BulkSoftDeleteRankingRepository(db);
    const user = c.get("user");
    if (!user) {
      return c.json({ message: "認証エラー" }, HTTP_STATUS.UNAUTHORIZED);
    }
    const userId = UserId.of(user.userId.value);
    const { ids } = c.req.valid("json");
    const usecase = new BulkSoftDeleteRankingUsecase(repository);

    const result = await usecase.execute({ userId, rankingIds: ids });

    return result.match(
      // 成功
      ({ value }) => c.json({
        message: toMessage(value),
        deletedCount: value.deletedCount,
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

export { bulkSoftDeleteRanking };
