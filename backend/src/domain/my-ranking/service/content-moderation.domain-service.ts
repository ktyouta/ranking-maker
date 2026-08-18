import { RankingAggregate } from "../aggregate";
import { IContentModerationRepository } from "../repository";

/**
 * 不適切内容チェックの判定結果。
 *
 * ドメインルール違反を表す Violation とは異なり、field は AI 判定対象を人間が
 * 識別するための表示ラベル（例: "メモ（2件目）"）であり、フォーム経路を示す
 */
export type ContentModerationViolation = {
  readonly field: string;
  readonly message: string;
};

export class ContentModerationDomainService {

  constructor(private readonly repository: IContentModerationRepository) { }

  /**
   * 入力内容チェック
   * @param aggregate 判定対象のランキング集約
   * @returns 不適切と判定された要素の判定結果一覧（問題なければ空配列）
   */
  async moderate(aggregate: RankingAggregate): Promise<ContentModerationViolation[]> {
    const targets = aggregate.toModerationTargets();

    if (targets.length === 0) {
      return [];
    }

    const inappropriateIndexes = await this.repository.detectInappropriateIndexes(targets);

    return inappropriateIndexes
      .filter((index) => index >= 0 && index < targets.length)
      .map((index) => {
        return { field: targets[index].field, message: `不適切な内容が含まれている可能性があります: ${targets[index].value}` };
      });
  }
}
