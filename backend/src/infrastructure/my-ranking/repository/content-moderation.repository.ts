import { z } from "zod";
import { ContentModerationTarget, IContentModerationRepository } from "../../../domain";

// AIモデル
// 3.1-8b-instruct-fp8 は response_format: json_schema 非対応で実行時エラーになるため使用不可。
// Cloudflare公式のJSON Mode対応モデル一覧（https://developers.cloudflare.com/workers-ai/json-mode/）
// のうち、この環境の @cloudflare/workers-types に型定義がある小型モデルを採用している。
const MODEL = "@cf/meta/llama-3-8b-instruct";

const SYSTEM_PROMPT = "あなたは入力内容の不適切判定を行うモデレーターです。"
  + "入力は「番号: テキスト」の形式で1行ずつ渡されます。"
  + "暴力的な表現、性的な表現、差別的な表現、誹謗中傷、個人情報の記載など、不適切な内容を含む行の番号のみを inappropriateIndexes に返してください。"
  + "問題がなければ空配列を返してください。";

const ModerationResponseSchema = z.object({
  inappropriateIndexes: z.array(z.number()),
});

export class ContentModerationRepository implements IContentModerationRepository {

  constructor(private readonly ai: Ai) { }

  /**
   * 判定対象一覧のうち、不適切と判定された要素のインデックス一覧を返す
   * @param targets 判定対象一覧
   */
  async detectInappropriateIndexes(targets: ContentModerationTarget[]): Promise<number[]> {
    const entriesText = targets.map((target, index) => `${index}: ${target.value}`).join("\n");

    const output = await this.ai.run(MODEL, {
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: entriesText,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          type: "object",
          properties: {
            inappropriateIndexes: { type: "array", items: { type: "number" } },
          },
          required: ["inappropriateIndexes"],
        },
      },
    });

    if (!output.response) {
      return [];
    }

    const parsed = ModerationResponseSchema.safeParse(JSON.parse(output.response));
    if (!parsed.success) {
      return [];
    }

    return parsed.data.inappropriateIndexes;
  }
}
