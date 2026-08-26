/**
 * 公開ステータス
 */
export class PublicStatus {

    static readonly PRIVATE = 1;
    static readonly PUBLIC = 2;
    static readonly VALUES: readonly number[] = [PublicStatus.PRIVATE, PublicStatus.PUBLIC];

    private readonly _value: number;

    constructor(publicStatus: number) {

        if (!PublicStatus.VALUES.includes(publicStatus)) {
            throw new Error(`公開ステータスが不正です。value:${publicStatus}`);
        }

        this._value = publicStatus;
    }

    get value() {
        return this._value;
    }
}
