import type { IUpdateSampleRepository } from "../repository";
import { UpdateSampleEntity } from "../entity";

/**
 * サンプル更新サービス
 */
export class UpdateSampleService {
  constructor(private readonly repository: IUpdateSampleRepository) {}

  /**
   * 更新
   * @param id サンプルID
   * @param name 名前
   * @param description 説明
   */
  async update(
    id: number,
    name?: string,
    description?: string
  ): Promise<UpdateSampleEntity | null> {
    const updateData: { name?: string; description?: string } = {};
    if (name !== undefined) {
      updateData.name = name;
    }
    if (description !== undefined) {
      updateData.description = description;
    }

    const record = await this.repository.update(id, updateData);
    if (!record) {
      return null;
    }
    return UpdateSampleEntity.fromRecord(record);
  }
}
