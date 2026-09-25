import type { RankingListType } from "../../../domain";

export type GetListRankingResultType = {
  id: string;
  title: string;
  publicStatus: number;
  userName: string;
  createdAt: string;
  itemCount: number;
}[];

/**
 * 公開ランキング一覧取得結果 DTO
 */
export class GetListRankingResultDto {
  private readonly _value: GetListRankingResultType;

  /**
   * @param list 公開ランキング一覧
   */
  constructor(list: RankingListType[]) {
    this._value = list.map((e) => ({
      id: e.id,
      title: e.title,
      publicStatus: e.publicStatus,
      userName: e.userName,
      createdAt: e.createdAt,
      itemCount: e.itemCount,
    }));
  }

  get value(): GetListRankingResultType {
    return this._value;
  }
}
