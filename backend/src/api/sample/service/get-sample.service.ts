import { GetSampleEntity } from "../entity";
import type { IGetSampleRepository } from "../repository";

/**
 * サンプル取得サービス
 */
export class GetSampleService {
  constructor(private readonly repository: IGetSampleRepository) { }

  /**
   * ID指定で取得
   * @param id サンプルID
   */
  async findById(id: number): Promise<GetSampleEntity | null> {
    const record = await this.repository.findById(id);
    if (!record) {
      return null;
    }
    return GetSampleEntity.fromRecord(record);
  }
}
