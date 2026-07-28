import type { Sample } from "../../../infrastructure/db";

/**
 * サンプル取得リポジトリインターフェース
 */
export interface IGetSampleRepository {
  /**
   * ID指定で取得
   * @param id サンプルID
   */
  findById(id: number): Promise<Sample | undefined>;
}
