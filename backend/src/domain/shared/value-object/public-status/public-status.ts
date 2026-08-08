const PUBLIC_STATUS = {
    PRIVATE: 1,
    PUBLIC: 2,
}

export class PublicStatus {

    private readonly _value: number;

    constructor(publicStatus: number) {

        if (!Object.values(PUBLIC_STATUS).includes(publicStatus)) {
            throw new Error(`公開ステータスが不正です。value:${publicStatus}`);
        }

        this._value = publicStatus;
    }

    get value() {
        return this._value;
    }
}