import { RankingAggregate, TagAggregate } from "../aggregate";
import { IContentModerationRepository } from "../repository";
import { ContentModerationTarget } from "../value-object";

export class ContentModerationDomainService {

  constructor(private readonly repository: IContentModerationRepository) { }

  /**
   * 入力内容チェック
   * ランキングの入力内容と、新規タグのタグ名を判定する。
   * @param aggregate 判定対象のランキング集約
   * @param newTagAggregates ランキングに付与する新規タグ
   * @returns 不適切と判定された判定対象の一覧（問題なければ空配列）
   */
  async moderate(aggregate: RankingAggregate, newTagAggregates: TagAggregate[]): Promise<ContentModerationTarget[]> {
    const targets = [
      ...this.toRankingTargets(aggregate),
      ...newTagAggregates.map((e) => ContentModerationTarget.tagName(e.name)),
    ];

    if (targets.length === 0) {
      return [];
    }

    const inappropriateIndexes = await this.repository.detectInappropriateIndexes(targets);

    return inappropriateIndexes
      .filter((index) => index >= 0 && index < targets.length)
      .map((index) => targets[index]);
  }

  /**
   * ランキングの判定対象一覧を作成する
   * @param aggregate 判定対象のランキング集約
   * @returns ユーザーが自由入力するフィールドの一覧
   */
  private toRankingTargets(aggregate: RankingAggregate): ContentModerationTarget[] {
    const targets = [ContentModerationTarget.title(aggregate.title)];

    if (aggregate.memo) {
      targets.push(ContentModerationTarget.memo(aggregate.memo));
    }

    aggregate.rankingOrderEntityList.forEach((item, index) => {
      if (item.itemName) {
        targets.push(ContentModerationTarget.itemName(index, item.itemName));
      }
      if (item.memo) {
        targets.push(ContentModerationTarget.itemMemo(index, item.memo));
      }
    });

    return targets;
  }
}
