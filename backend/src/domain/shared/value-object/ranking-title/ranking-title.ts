
/**
 * ランキング名
 */
export class RankingTitle {
  private readonly _value: string;

  constructor(rankingTitle: string) {
    if (!rankingTitle) {
      throw new Error(`ランキングタイトルが存在しません。`);
    }
    this._value = rankingTitle;
  }

  get value(): string {
    return this._value;
  }
}
