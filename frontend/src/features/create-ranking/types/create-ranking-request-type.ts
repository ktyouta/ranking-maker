import { TAG_NAME_SEPARATOR } from "@/constants/tag-name";
import { z } from "zod";

const RANKING_TITLE_MAX_LENGTH = 100;
const RANKING_MEMO_MAX_LENGTH = 1000;
const ITEM_NAME_MAX_LENGTH = 100;
const ITEM_MEMO_MAX_LENGTH = 1000;
export const TAG_NAME_MAX_LENGTH = 20;
export const MAX_TAG_COUNT = 20;

export const CreateRankingRequestSchema = z.object({
    title: z.string()
        .nonempty("タイトルを入力してください")
        .max(RANKING_TITLE_MAX_LENGTH, `タイトルは${RANKING_TITLE_MAX_LENGTH}文字以内で入力してください`),
    isPublic: z.boolean(),
    icon: z.number().int().min(1, "アイコンを選択してください"),
    memo: z.string()
        .max(RANKING_MEMO_MAX_LENGTH, `メモは${RANKING_MEMO_MAX_LENGTH}文字以内で入力してください`),
    items: z.array(
        z.object({
            itemName: z.string()
                .max(ITEM_NAME_MAX_LENGTH, `項目名は${ITEM_NAME_MAX_LENGTH}文字以内で入力してください`),
            memo: z.string()
                .max(ITEM_MEMO_MAX_LENGTH, `メモは${ITEM_MEMO_MAX_LENGTH}文字以内で入力してください`),
        })
    ).refine((items) => {
        const filteredItems = items.filter((e) => !!e.itemName);
        return new Set(filteredItems.map((item) => item.itemName)).size === filteredItems.length;
    }, {
        message: "項目名が重複しています",
    }),
    tags: z.array(
        z.string()
            .max(TAG_NAME_MAX_LENGTH, `タグは${TAG_NAME_MAX_LENGTH}文字以内で入力してください`)
            .refine((tag) => !tag.includes(TAG_NAME_SEPARATOR), `タグに「${TAG_NAME_SEPARATOR}」は使えません`)
    ).max(MAX_TAG_COUNT, `タグは${MAX_TAG_COUNT}個までです`),
});

export type CreateRankingRequestType = z.infer<typeof CreateRankingRequestSchema>;
