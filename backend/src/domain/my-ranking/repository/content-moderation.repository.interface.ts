import { ContentModerationTarget } from "../aggregate";

export interface IContentModerationRepository {

  /**
   * 判定対象一覧のうち、不適切と判定された要素のインデックス一覧を返す
   * @param targets 判定対象一覧
   * @returns targets のインデックスに対応する、不適切と判定された要素の位置一覧（問題なければ空配列）
   */
  detectInappropriateIndexes(targets: ContentModerationTarget[]): Promise<number[]>;
}
