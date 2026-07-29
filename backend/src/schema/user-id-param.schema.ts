import { z } from "zod";

/**
 * ユーザーIDパラメータスキーマ
 */
export const UserIdParamSchema = z.object({
  userId: z.string().min(1, "ユーザーIDを指定してください"),
});

export type UserIdParamSchemaType = z.infer<typeof UserIdParamSchema>;
