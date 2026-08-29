import { z } from "zod";

const RANKING_TITLE_MAX_LENGTH = 100;
const RANKING_MEMO_MAX_LENGTH = 1000;
const ITEM_NAME_MAX_LENGTH = 100;
const ITEM_MEMO_MAX_LENGTH = 1000;

export const UpdateRankingRequestSchema = z.object({
    title: z.string()
        .nonempty("タイトルを入力してください")
        .max(RANKING_TITLE_MAX_LENGTH, `タイトルは${RANKING_TITLE_MAX_LENGTH}文字以内で入力してください`),
    isPublic: z.boolean(),
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
});

export type UpdateRankingRequestType = z.infer<typeof UpdateRankingRequestSchema>;
