import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import type { AppEnv } from "../../../types";
import { formatZodErrors } from "../../../util";
import { UpdateSampleResponseDto } from "../dto";
import { UpdateSampleRepository } from "../repository";
import { UpdateSampleParamSchema, UpdateSampleSchema } from "../schema";
import { UpdateSampleService } from "../service";

/**
 * サンプル更新
 * @route PUT /api/v1/sample/:id
 */
const updateSample = new Hono<AppEnv>().put(
  `${API_ENDPOINT.SAMPLE}/:id`,
  zValidator("param", UpdateSampleParamSchema, (result, c) => {
    if (!result.success) {
      return c.json({ message: "パラメータが不正です。", data: formatZodErrors(result.error) }, HTTP_STATUS.BAD_REQUEST);
    }
  }),
  zValidator("json", UpdateSampleSchema, (result, c) => {
    if (!result.success) {
      return c.json({ message: "バリデーションエラー", data: formatZodErrors(result.error) }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
    }
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const db = c.get('db');
    const repository = new UpdateSampleRepository(db);
    const service = new UpdateSampleService(repository);

    const entity = await service.update(Number(id), body.name, body.description);

    if (!entity) {
      return c.json({ message: "サンプルが見つかりません。" }, HTTP_STATUS.NOT_FOUND);
    }

    const responseDto = new UpdateSampleResponseDto(entity);

    return c.json({ message: "サンプルを更新しました。", data: responseDto.value }, HTTP_STATUS.OK);
  }
);

export { updateSample };
