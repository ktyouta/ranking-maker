import { and, eq } from "drizzle-orm";
import { IIconValidityRepository, RankingIcon } from "../../../domain";
import { iconMaster, type Database } from "../../db";

/**
 * アイコン有効性判定リポジトリ実装
 */
export class IconValidityRepository implements IIconValidityRepository {
  constructor(private readonly db: Database) { }

  /**
   * 指定したアイコンIDが icon_master に存在し、有効（未削除）かどうかを判定する
   */
  async exists(rankingIcon: RankingIcon): Promise<boolean> {
    const result = await this.db
      .select({ id: iconMaster.id })
      .from(iconMaster)
      .where(and(
        eq(iconMaster.id, rankingIcon.value),
        eq(iconMaster.deleteFlg, false),
      ));

    return result.length > 0;
  }
}
