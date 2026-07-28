import type { Sample } from "../../../infrastructure/db";

/**
 * サンプル作成入力型
 */
export type CreateSampleInput = {
  name: string;
  description?: string | null;
};

/**
 * サンプル作成リポジトリインターフェース
 */
export interface ICreateSampleRepository {
  /**
   * 作成
   * @param data 作成データ
   */
  create(data: CreateSampleInput): Promise<Sample>;
}
