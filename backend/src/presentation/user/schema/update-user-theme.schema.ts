import { z } from "zod";

export const UpdateUserThemeSchema = z.object({
  theme: z.enum(["lavender", "teal", "peach", "dark"], {
    errorMap: () => ({ message: "テーマの値が不正です" }),
  }),
});

export type UpdateUserThemeSchemaType = z.infer<typeof UpdateUserThemeSchema>;
