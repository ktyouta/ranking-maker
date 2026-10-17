import { err, ok, type Result } from "neverthrow";

/**
 * 公開ステータスの生成失敗
 */
export type PublicStatusError = { type: "PUBLIC_STATUS_INVALID" };

/**
 * 公開ステータス
 */
export class PublicStatus {
    static readonly PRIVATE = 1;
    static readonly PUBLIC = 2;
    static readonly VALUES: readonly number[] = [PublicStatus.PRIVATE, PublicStatus.PUBLIC];

    private readonly _value: number;

    /**
     * @param publicStatus 許容値のいずれかである公開ステータス
     */
    private constructor(publicStatus: number) {
        this._value = publicStatus;
    }

    get value() {
        return this._value;
    }

    /**
     * 外部からの入力値から生成する
     * @param publicStatus 公開ステータス
     * @returns 成功時は公開ステータス、許容値以外の場合はその内容を持つ Result
     */
    static create(publicStatus: number): Result<PublicStatus, PublicStatusError> {
        if (!PublicStatus.VALUES.includes(publicStatus)) {
            return err({ type: "PUBLIC_STATUS_INVALID" });
        }

        return ok(new PublicStatus(publicStatus));
    }

    /**
     * 永続化済みの値など、制約を満たすことが保証された値から生成する
     * @param publicStatus 公開ステータス
     * @returns 公開ステータス
     * @throws 制約を満たさない場合（呼び出し側の不具合）
     */
    static of(publicStatus: number): PublicStatus {
        return PublicStatus.create(publicStatus).match(
            (status) => status,
            (error) => { throw new Error(`公開ステータスが不正です。type:${error.type} value:${publicStatus}`); },
        );
    }
}
