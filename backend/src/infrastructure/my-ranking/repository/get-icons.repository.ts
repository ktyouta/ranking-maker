import { eq } from "drizzle-orm";
import { IconMasterRecord, IGetIconsRepository } from "../../../domain";
import { iconMaster, type Database } from "../../db";

/**
 * アイコン一覧取得リポジトリ実装
 */
export class GetIconsRepository implements IGetIconsRepository {
  constructor(private readonly db: Database) { }

  /**
   * 選択可能なアイコン一覧を取得する（deleteFlg=false のみ）
   */
  async findIcons(): Promise<IconMasterRecord[]> {
    const result = await this.db
      .select({
        id: iconMaster.id,
        emoji: iconMaster.emoji,
      })
      .from(iconMaster)
      .where(eq(iconMaster.deleteFlg, false));

    return result;
  }
}
