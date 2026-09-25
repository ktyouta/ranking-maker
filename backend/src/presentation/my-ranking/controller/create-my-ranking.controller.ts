import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { CreateMyRankingUsecase } from "../../../application";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { ContentModerationDomainService, ContentModerationTarget, IconValidityDomainService, RankingCreateError, RankingTitleUniquenessDomainService, UserId } from "../../../domain";
import { ContentModerationRepository, CreateMyRankingRepository, IconValidityRepository, RankingTitleUniquenessRepository } from "../../../infrastructure";
import { authMiddleware } from "../../../middleware";
import type { AppEnv, ValidationErrorType } from "../../../types";
import { formatZodErrors } from "../../../util";
import { CreateMyRankingSchema } from "../schema";

/**
 * ランキング生成時のエラーをレスポンス用のバリデーションエラーに変換する
 * @param error ランキング生成時のエラー
 */
function toValidationError(error: RankingCreateError): ValidationErrorType {
  switch (error.type) {
    case "DUPLICATE_ITEM_NAME":
      return { field: "items", message: `名称が重複しています: ${error.itemName}` };
    case "DUPLICATE_ORDER":
      return { field: "items", message: `順位が重複しています: ${error.order}` };
  }
}

/**
 * 不適切と判定された判定対象をレスポンス用のバリデーションエラーに変換する
 * @param target 不適切と判定された判定対象
 */
function toInappropriateContentError(target: ContentModerationTarget): ValidationErrorType {
  return { field: toModerationTargetLabel(target), message: `不適切な内容が含まれている可能性があります: ${target.value}` };
}

/**
 * 判定対象の表示ラベルを作成する
 * @param target 判定対象
 */
function toModerationTargetLabel(target: ContentModerationTarget): string {
  switch (target.type) {
    case "TITLE":
      return "タイトル";
    case "MEMO":
      return "メモ";
    case "ITEM_NAME":
      return `項目名（${target.itemIndex + 1}件目）`;
    case "ITEM_MEMO":
      return `メモ（${target.itemIndex + 1}件目）`;
  }
}

/**
 * ランキング作成
 */
const createMyRanking = new Hono<AppEnv>().post(API_ENDPOINT.MY_RANKING,
  authMiddleware,
  zValidator("json", CreateMyRankingSchema, (result, c) => {
    if (!result.success) {
      return c.json({ message: "バリデーションエラー", data: formatZodErrors(result.error) }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
    }
  }),
  async (c) => {
    const db = c.get('db');
    const user = c.get("user");
    if (!user) {
      return c.json({ message: "認証エラー" }, HTTP_STATUS.UNAUTHORIZED);
    }
    const userId = UserId.of(user.userId.value);
    const body = c.req.valid("json");
    const uniquenessService = new RankingTitleUniquenessDomainService(new RankingTitleUniquenessRepository(db));
    const contentModerationService = new ContentModerationDomainService(new ContentModerationRepository(c.env.AI));
    const iconValidityService = new IconValidityDomainService(new IconValidityRepository(db));
    const service = new CreateMyRankingUsecase(new CreateMyRankingRepository(db), uniquenessService, contentModerationService, iconValidityService);

    const result = await service.execute({ userId, body });

    return result.match(
      // 成功
      (dto) => c.json(
        { message: "ランキングを作成しました。", data: dto.value },
        HTTP_STATUS.CREATED,
      ),
      // 失敗
      (error) => {
        switch (error.type) {
          case "VALIDATION":
            return c.json({ message: "入力エラー", data: error.errors.map(toValidationError) }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
          case "DUPLICATE_TITLE":
            return c.json({ message: "同名のランキングが既に存在します。" }, HTTP_STATUS.CONFLICT);
          case "INVALID_ICON":
            return c.json({ message: "入力エラー", data: [{ field: "icon", message: "指定されたアイコンは存在しません。" }] }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
          case "INAPPROPRIATE_CONTENT":
            return c.json({ message: "不適切な内容が含まれています。", data: error.targets.map(toInappropriateContentError) }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
          default: {
            const _: never = error;
            return c.json({ message: "サーバーエラー" }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
          }
        }
      },
    );
  });

export { createMyRanking };
