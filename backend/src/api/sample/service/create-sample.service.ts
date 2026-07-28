import type { ICreateSampleRepository } from "../repository";
import { CreateSampleEntity } from "../entity";

/**
 * サンプル作成サービス
 */
export class CreateSampleService {
  constructor(private readonly repository: ICreateSampleRepository) {}

  /**
   * 作成
   * @param name 名前
   * @param description 説明
   */
  async create(name: string, description?: string): Promise<CreateSampleEntity> {
    const record = await this.repository.create({
      name,
      description: description ?? null,
    });
    return CreateSampleEntity.fromRecord(record);
  }
}
