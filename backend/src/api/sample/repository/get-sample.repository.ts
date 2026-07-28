import { and, eq } from "drizzle-orm";
import type { Database, Sample } from "../../../infrastructure/db";
import { sample } from "../../../infrastructure/db";
import type { IGetSampleRepository } from "./get-sample.repository.interface";

/**
 * サンプル取得リポジトリ実装
 */
export class GetSampleRepository implements IGetSampleRepository {
  constructor(private readonly db: Database) { }

  /**
   * ID指定で取得
   */
  async findById(id: number): Promise<Sample | undefined> {
    const result = await this.db
      .select()
      .from(sample)
      .where(and(eq(sample.id, id), eq(sample.deleteFlg, false)));
    return result[0];
  }
}
