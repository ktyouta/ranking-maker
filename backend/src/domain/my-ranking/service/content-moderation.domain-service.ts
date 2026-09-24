import { ContentModerationTarget, RankingAggregate } from "../aggregate";
import { IContentModerationRepository } from "../repository";

export class ContentModerationDomainService {

  constructor(private readonly repository: IContentModerationRepository) { }

  /**
   * 入力内容チェック
   * @param aggregate 判定対象のランキング集約
   * @returns 不適切と判定された判定対象の一覧（問題なければ空配列）
   */
  async moderate(aggregate: RankingAggregate): Promise<ContentModerationTarget[]> {
    const targets = aggregate.toModerationTargets();

    if (targets.length === 0) {
      return [];
    }

    const inappropriateIndexes = await this.repository.detectInappropriateIndexes(targets);

    return inappropriateIndexes
      .filter((index) => index >= 0 && index < targets.length)
      .map((index) => targets[index]);
  }
}
