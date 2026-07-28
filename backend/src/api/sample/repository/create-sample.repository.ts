import type { Database, Sample } from "../../../infrastructure/db";
import { sample } from "../../../infrastructure/db";
import type { ICreateSampleRepository, CreateSampleInput } from "./create-sample.repository.interface";

/**
 * サンプル作成リポジトリ実装
 */
export class CreateSampleRepository implements ICreateSampleRepository {
  constructor(private readonly db: Database) {}

  /**
   * 作成
   */
  async create(data: CreateSampleInput): Promise<Sample> {
    const now = new Date().toISOString();
    const result = await this.db
      .insert(sample)
      .values({
        name: data.name,
        description: data.description ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return result[0];
  }
}
