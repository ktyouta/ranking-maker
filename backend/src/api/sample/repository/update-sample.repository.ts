import { and, eq } from "drizzle-orm";
import type { Database, Sample } from "../../../infrastructure/db";
import { sample } from "../../../infrastructure/db";
import type { IUpdateSampleRepository, UpdateSampleInput } from "./update-sample.repository.interface";

/**
 * サンプル更新リポジトリ実装
 */
export class UpdateSampleRepository implements IUpdateSampleRepository {
  constructor(private readonly db: Database) { }

  /**
   * 更新
   */
  async update(id: number, data: UpdateSampleInput): Promise<Sample | undefined> {
    const now = new Date().toISOString();
    const result = await this.db
      .update(sample)
      .set({
        ...data,
        updatedAt: now,
      })
      .where(and(eq(sample.id, id), eq(sample.deleteFlg, false)))
      .returning();
    return result[0];
  }
}
