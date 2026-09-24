import { TagId, TagName } from "../../value-object";

export class TagEntity {

    constructor(private readonly _tagId: TagId,
        private readonly _name: TagName,
    ) { }

    get tagId() {
        return this._tagId.value;
    }

    get name() {
        return this._name.value;
    }
}