import type { IDeleteSampleRepository } from "../repository";

/**
 * サンプル削除サービス
 */
export class DeleteSampleService {
  constructor(private readonly repository: IDeleteSampleRepository) {}

  /**
   * 削除
   * @param id サンプルID
   */
  async delete(id: number): Promise<boolean> {
    return await this.repository.delete(id);
  }
}
