export type RankingListType = {
  id: string;
  title: string;
  publicStatus: number;
  userName: string;
  createdAt: string;
};

/**
 * ランキング一覧取得リポジトリインターフェース
 */
export interface IGetListRankingRepository {
  /**
   * 全件取得
   */
  findAll(): Promise<RankingListType[]>;
}
