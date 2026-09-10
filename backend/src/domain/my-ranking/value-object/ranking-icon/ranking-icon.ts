/**
 * ランキングアイコン
 */
export class RankingIcon {
  private readonly _value: number;

  constructor(iconId: number) {
    if (!Number.isInteger(iconId) || iconId < 1) {
      throw new Error(`アイコンIDが不正です。iconId:${iconId}`);
    }
    this._value = iconId;
  }

  get value(): number {
    return this._value;
  }
}
