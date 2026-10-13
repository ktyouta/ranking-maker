import { Hono } from "hono";
import { GetMyRankingExportUsecase } from "../../../../application";
import type { GetMyRankingExportResultType } from "../../../../application";
import { API_ENDPOINT, HTTP_STATUS } from "../../../../constant";
import { UserId } from "../../../../domain";
import { GetMyRankingExportRepository } from "../../../../infrastructure";
import { authMiddleware, validatorMiddleware } from "../../../../middleware";
import type { AppEnv } from "../../../../types";
import { buildCsv, formatExportFilenameTimestamp } from "../../../../util";
import { toInputErrorMessage } from "../../error-message";
import { GetMyRankingExportSchema } from "../../schema";

const CSV_HEADERS = ["ランキングタイトル", "順位", "項目名", "メモ"];

/**
 * エクスポート対象のランキングを CSV 文字列に変換する
 * @param rankings エクスポート対象のランキング
 * @returns CSV 文字列
 */
function toCsv(rankings: GetMyRankingExportResultType): string {
  const rows = rankings.flatMap((ranking) =>
    ranking.items.map((item) => [
      ranking.ranking.title,
      String(item.order),
      item.itemName ?? "",
      item.itemMemo ?? "",
    ])
  );
  return buildCsv(CSV_HEADERS, rows);
}

/**
 * ランキングCSVエクスポート
 */
const getMyRankingExport = new Hono<AppEnv>().post(API_ENDPOINT.MY_RANKING_EXPORT,
  authMiddleware,
  validatorMiddleware("json", GetMyRankingExportSchema),
  async (c) => {
    const db = c.get('db');
    const repository = new GetMyRankingExportRepository(db);
    const user = c.get("user");
    if (!user) {
      return c.json({ message: "認証エラー" }, HTTP_STATUS.UNAUTHORIZED);
    }
    const userId = UserId.of(user.userId.value);
    const { ids } = c.req.valid("json");
    const usecase = new GetMyRankingExportUsecase(repository);

    const result = await usecase.execute({ userId, rankingIds: ids });

    return result.match(
      // 成功
      ({ value: rankings }) => {
        if (rankings.length === 0) {
          return c.json({ message: "エクスポート対象のランキングが見つかりませんでした。" }, HTTP_STATUS.OK);
        }

        const csv = toCsv(rankings);
        const filename = `ranking_${formatExportFilenameTimestamp(new Date())}.csv`;

        return c.text(csv, HTTP_STATUS.OK, {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        });
      },
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

export { getMyRankingExport };
