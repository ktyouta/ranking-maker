import { z } from "zod";

/**
 * ユーザーIDパラメータスキーマ
 */
export const UserIdParamSchema = z.object({
  userId: z.coerce.number({ invalid_type_error: "ユーザーIDは数値で指定してください" }).int().positive(),
});

export type UserIdParamSchemaType = z.infer<typeof UserIdParamSchema>;
