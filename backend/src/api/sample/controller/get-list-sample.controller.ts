import { Hono } from "hono";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import type { AppEnv } from "../../../types";
import { GetListSampleResponseDto } from "../dto";
import { GetListSampleRepository } from "../repository";
import { GetListSampleService } from "../service";

/**
 * サンプル一覧取得
 * @route GET /api/v1/sample
 */
const getListSample = new Hono<AppEnv>().get(API_ENDPOINT.SAMPLE, async (c) => {
  const db = c.get('db');
  const repository = new GetListSampleRepository(db);
  const service = new GetListSampleService(repository);

  const entities = await service.findAll();
  const responseDto = new GetListSampleResponseDto(entities);

  return c.json({ message: "サンプル一覧を取得しました。", data: responseDto.value }, HTTP_STATUS.OK);
});

export { getListSample };
