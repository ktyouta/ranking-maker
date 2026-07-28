import type { Sample } from "../../../infrastructure/db";

/**
 * サンプル一覧取得リポジトリインターフェース
 */
export interface IGetListSampleRepository {
  /**
   * 全件取得
   */
  findAll(): Promise<Sample[]>;
}
