import { GetListSampleEntity } from "../entity";
import type { IGetListSampleRepository } from "../repository";

/**
 * サンプル一覧取得サービス
 */
export class GetListSampleService {
  constructor(private readonly repository: IGetListSampleRepository) { }

  /**
   * 全件取得
   */
  async findAll(): Promise<GetListSampleEntity[]> {
    const records = await this.repository.findAll();
    return records.map((record) => GetListSampleEntity.fromRecord(record));
  }
}
