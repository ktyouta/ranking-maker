/**
 * 公開ステータスの許容値（1: 非公開 / 2: 公開）
 */
export const PUBLIC_STATUS = {
    PRIVATE: 1,
    PUBLIC: 2,
} as const;

export const PUBLIC_STATUS_VALUES: readonly number[] = Object.values(PUBLIC_STATUS);

/**
 * 公開ステータス
 */
export class PublicStatus {

    private readonly _value: number;

    constructor(publicStatus: number) {

        if (!PUBLIC_STATUS_VALUES.includes(publicStatus)) {
            throw new Error(`公開ステータスが不正です。value:${publicStatus}`);
        }

        this._value = publicStatus;
    }

    get value() {
        return this._value;
    }
}
