
/**
 * ランキングタイトル
 */
export class RankingTitle {
  static readonly MAX_LENGTH = 100;
  private readonly _value: string;

  constructor(rankingTitle: string) {
    const trimmed = rankingTitle.trim();
    if (!trimmed) {
      throw new Error(`ランキングタイトルが存在しません。`);
    }
    if (trimmed.length > RankingTitle.MAX_LENGTH) {
      throw new Error(`ランキングタイトルは${RankingTitle.MAX_LENGTH}文字以内で入力してください。`);
    }
    this._value = trimmed;
  }

  get value(): string {
    return this._value;
  }
}
