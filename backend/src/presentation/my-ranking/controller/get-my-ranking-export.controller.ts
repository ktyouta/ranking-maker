import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { GetMyRankingExportUsecase } from "../../../application";
import type { GetMyRankingExportResultType } from "../../../application";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { RankingId, UserId } from "../../../domain";
import { GetMyRankingExportRepository } from "../../../infrastructure";
import { authMiddleware } from "../../../middleware";
import type { AppEnv } from "../../../types";
import { buildCsv, formatExportFilenameTimestamp, formatZodErrors } from "../../../util";
import { GetMyRankingExportSchema } from "../schema";

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
  zValidator("json", GetMyRankingExportSchema, (result, c) => {
    if (!result.success) {
      return c.json({ message: "リクエストが不正です。", data: formatZodErrors(result.error) }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
    }
  }),
  async (c) => {
    const db = c.get('db');
    const repository = new GetMyRankingExportRepository(db);
    const user = c.get("user");
    if (!user) {
      return c.json({ message: "認証エラー" }, HTTP_STATUS.UNAUTHORIZED);
    }
    const userId = UserId.of(user.userId.value);
    const { ids } = c.req.valid("json");
    const rankingIds = ids.map((id) => RankingId.of(id));
    const usecase = new GetMyRankingExportUsecase(repository);

    const { value: rankings } = await usecase.execute(userId, rankingIds);

    if (rankings.length === 0) {
      return c.json({ message: "エクスポート対象のランキングが見つかりませんでした。" }, HTTP_STATUS.OK);
    }

    const csv = toCsv(rankings);
    const filename = `ranking_${formatExportFilenameTimestamp(new Date())}.csv`;

    return c.text(csv, HTTP_STATUS.OK, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    });
  });

export { getMyRankingExport };
