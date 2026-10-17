import { err, ok, type Result } from "neverthrow";

/**
 * ランキングタイトルの生成失敗
 */
export type RankingTitleError = { type: "RANKING_TITLE_EMPTY" }
  | { type: "RANKING_TITLE_TOO_LONG"; max: number };

/**
 * ランキングタイトル
 */
export class RankingTitle {
  static readonly MAX_LENGTH = 100;
  private readonly _value: string;

  /**
   * @param rankingTitle 前後の空白を除去済みのランキングタイトル
   */
  private constructor(rankingTitle: string) {
    this._value = rankingTitle;
  }

  get value(): string {
    return this._value;
  }

  /**
   * 外部からの入力値から生成する（前後の空白は除去する）
   * @param rankingTitle ランキングタイトル
   * @returns 成功時はランキングタイトル、空・上限文字数超過の場合はその内容を持つ Result
   */
  static create(rankingTitle: string): Result<RankingTitle, RankingTitleError> {
    const trimmed = rankingTitle.trim();

    if (!trimmed) {
      return err({ type: "RANKING_TITLE_EMPTY" });
    }

    if (trimmed.length > RankingTitle.MAX_LENGTH) {
      return err({ type: "RANKING_TITLE_TOO_LONG", max: RankingTitle.MAX_LENGTH });
    }

    return ok(new RankingTitle(trimmed));
  }

  /**
   * 永続化済みの値など、制約を満たすことが保証された値から生成する
   * @param rankingTitle ランキングタイトル
   * @returns ランキングタイトル
   * @throws 制約を満たさない場合（呼び出し側の不具合）
   */
  static of(rankingTitle: string): RankingTitle {
    return RankingTitle.create(rankingTitle).match(
      (title) => title,
      (error) => { throw new Error(`ランキングタイトルが不正です。type:${error.type}`); },
    );
  }
}
