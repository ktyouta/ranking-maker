import { z } from "zod";
import { ContentModerationTarget, IContentModerationRepository } from "../../../domain";

// AIモデル
// @cf/meta/llama-3-8b-instruct は 2026-05-30 に廃止された。
// response_format: json_schema はモデルにより対応状況・出力形式（文字列/オブジェクト）が揺れて
// 実行時エラーの原因になったため、json_schemaに依存しない構成に変更している。
// 同じCloudflare Workers AI構成で稼働実績のある実装を参考に、
// プロンプトでJSON出力を指示し文字列から手動抽出する方式にした。
const MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8";

const SYSTEM_PROMPT = "あなたは入力内容の不適切判定を行うモデレーターです。"
  + "入力は「番号: テキスト」の形式で1行ずつ渡されます。"
  + "暴力的な表現、性的な表現、差別的な表現、誹謗中傷、個人情報の記載など、不適切な内容を含む行の番号のみを inappropriateIndexes に返してください。"
  + "問題がなければ空配列を返してください。"
  + "必ず次のJSON形式のみで出力してください（前置き・説明・コードブロック不要）: "
  + '{"inappropriateIndexes":[番号, ...]}';

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
    });

    const raw = (output.response ?? "").trim();
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      return [];
    }

    try {
      const parsed = ModerationResponseSchema.safeParse(JSON.parse(raw.slice(jsonStart, jsonEnd + 1)));
      if (!parsed.success) {
        return [];
      }
      return parsed.data.inappropriateIndexes;
    } catch {
      return [];
    }
  }
}
