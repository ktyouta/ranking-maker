import { err, ok, type Result } from "neverthrow";

/**
 * ランキングアイコンの生成失敗
 */
export type RankingIconError = { type: "RANKING_ICON_INVALID" };

/**
 * ランキングアイコン
 */
export class RankingIcon {
  private readonly _value: number;

  /**
   * @param iconId 1以上の整数のアイコンID
   */
  private constructor(iconId: number) {
    this._value = iconId;
  }

  get value(): number {
    return this._value;
  }

  /**
   * 外部からの入力値から生成する（実在・有効性は IconValidityDomainService で判定する）
   * @param iconId アイコンID
   * @returns 成功時はランキングアイコン、1以上の整数でない場合はその内容を持つ Result
   */
  static create(iconId: number): Result<RankingIcon, RankingIconError> {
    if (!Number.isInteger(iconId) || iconId < 1) {
      return err({ type: "RANKING_ICON_INVALID" });
    }

    return ok(new RankingIcon(iconId));
  }

  /**
   * 永続化済みの値など、制約を満たすことが保証された値から生成する
   * @param iconId アイコンID
   * @returns ランキングアイコン
   * @throws 制約を満たさない場合（呼び出し側の不具合）
   */
  static of(iconId: number): RankingIcon {
    return RankingIcon.create(iconId).match(
      (icon) => icon,
      (error) => { throw new Error(`アイコンIDが不正です。type:${error.type} iconId:${iconId}`); },
    );
  }
}
