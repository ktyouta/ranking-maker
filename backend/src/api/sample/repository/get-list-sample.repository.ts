import { eq } from "drizzle-orm";
import type { Database, Sample } from "../../../infrastructure/db";
import { sample } from "../../../infrastructure/db";
import type { IGetListSampleRepository } from "./get-list-sample.repository.interface";

/**
 * サンプル一覧取得リポジトリ実装
 */
export class GetListSampleRepository implements IGetListSampleRepository {
  constructor(private readonly db: Database) { }

  /**
   * 全件取得（論理削除されていないもの）
   */
  async findAll(): Promise<Sample[]> {
    return await this.db
      .select()
      .from(sample)
      .where(eq(sample.deleteFlg, false));
  }
}
