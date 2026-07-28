import { and, eq } from "drizzle-orm";
import type { Database } from "../../../infrastructure/db";
import { sample } from "../../../infrastructure/db";
import type { IDeleteSampleRepository } from "./delete-sample.repository.interface";

/**
 * サンプル削除リポジトリ実装
 */
export class DeleteSampleRepository implements IDeleteSampleRepository {
  constructor(private readonly db: Database) { }

  /**
   * 削除（論理削除）
   */
  async delete(id: number): Promise<boolean> {
    const now = new Date().toISOString();
    const result = await this.db
      .update(sample)
      .set({
        deleteFlg: true,
        updatedAt: now,
      })
      .where(and(eq(sample.id, id), eq(sample.deleteFlg, false)))
      .returning();
    return result.length > 0;
  }
}
