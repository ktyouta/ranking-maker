import { IGetMyRankingExportRepository, RankingId } from "../../../domain";
import { UserId } from "../../../domain/shared";

export type MyRankingExportResultType = {
  ranking: {
    id: string;
    title: string;
  };
  items: {
    itemName: string | null;
    itemMemo: string | null;
    order: number;
  }[];
};

/**
 * ランキングCSVエクスポート用データ取得ユースケース
 */
export class GetMyRankingExportUsecase {
  constructor(private readonly repository: IGetMyRankingExportRepository) { }

  /**
   * 指定IDのうち、自身が所有するランキングの項目一覧を取得する
   *
   * セキュリティ上必須: 必ず①所有権フィルタ済みのランキング一覧を取得 →
   * ②その結果に含まれる rankingId のみをオーダー取得に渡す、の順序を守る。
   * クライアントから渡された生の rankingIds をオーダー取得にそのまま渡さない。
   */
  async execute(userId: UserId, rankingIds: RankingId[]): Promise<MyRankingExportResultType[]> {

    // ①所有権フィルタ済みのランキング一覧
    const rankings = await this.repository.findRankings(userId, rankingIds);

    if (rankings.length === 0) {
      return [];
    }

    // ②①に含まれる rankingId のみでオーダーを取得
    const ownedRankingIds = rankings.map((ranking) => RankingId.of(ranking.id));
    const orders = await this.repository.findRankingOrders(ownedRankingIds);

    return rankings.map((ranking) => ({
      ranking,
      items: orders
        .filter((order) => order.rankingId === ranking.id)
        .map((order) => ({ itemName: order.itemName, itemMemo: order.itemMemo, order: order.order })),
    }));
  }
}
