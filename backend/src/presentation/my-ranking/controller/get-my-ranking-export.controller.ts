import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { GetMyRankingExportUsecase } from "../../../application";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { RankingId, UserId } from "../../../domain";
import { GetMyRankingExportRepository } from "../../../infrastructure";
import { authMiddleware } from "../../../middleware";
import type { AppEnv } from "../../../types";
import { formatExportFilenameTimestamp, formatZodErrors } from "../../../util";
import { GetMyRankingExportResponseDto } from "../dto";
import { GetMyRankingExportSchema } from "../schema";

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

    const rankings = await usecase.execute(userId, rankingIds);

    if (rankings.length === 0) {
      return c.json({ message: "エクスポート対象のランキングが見つかりませんでした。" }, HTTP_STATUS.OK);
    }

    const csv = new GetMyRankingExportResponseDto(rankings).value;
    const filename = `ranking_${formatExportFilenameTimestamp(new Date())}.csv`;

    return c.text(csv, HTTP_STATUS.OK, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    });
  });

export { getMyRankingExport };
