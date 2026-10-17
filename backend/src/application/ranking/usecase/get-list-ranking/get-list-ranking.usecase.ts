import { err, ok, Result } from "neverthrow";
import { type IGetListRankingRepository, RankingAggregate, RankingListPagination, type RankingListPaginationError, RankingSort, type RankingSortError, TagName, type TagNameError } from "../../../../domain";
import { UserId } from "../../../../domain/shared";
import { GetListRankingResultDto } from "../../dto";

/**
 * ランキング一覧取得の入力値の制約違反（field は入力値の項目名。タグは `tags.{タグの添字}`、タグの件数超過は `tags`）
 */
export type GetListRankingInputError =
  | { field: "sort"; error: RankingSortError }
  | { field: "page"; error: RankingListPaginationError }
  | { field: `tags.${number}`; error: TagNameError }
  | { field: "tags"; error: { type: "TOO_MANY_FILTER_TAGS"; max: number } };

export type GetListRankingError = { type: "INVALID_INPUT"; errors: GetListRankingInputError[] };

type GetListRankingQuery = {
  keyword?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  updatedAtFrom?: string;
  updatedAtTo?: string;
  favoriteOnly: boolean;
  tags: string[];
  sort?: string;
  page?: number;
};

type PropsType = {
  userId: UserId;
  query: GetListRankingQuery;
}

/**
 * ランキング一覧取得ユースケース
 */
export class GetListRankingUsecase {

  // 1ページあたりの最大取得件数
  static readonly PAGE_SIZE = 30;
  // 1ランキングに付けられるタグの上限を超えて指定しても必ず0件になるため、同じ上限で制限する
  static readonly MAX_FILTER_TAG_COUNT = RankingAggregate.MAX_TAG_COUNT;

  constructor(private readonly repository: IGetListRankingRepository) { }

  /**
   * 一覧取得（ページング・絞り込み対応）
   * @param userId ランキングを所有するユーザーID
   * @param query 絞り込み・並び順・ページ番号の条件
   * @returns 成功時は指定ページのランキング一覧・全件数・総ページ数。
   * 入力値が制約を満たさない場合は INVALID_INPUT（違反はすべて返し、一覧・件数は問い合わせない）
   */
  async execute({ userId, query }: PropsType): Promise<Result<GetListRankingResultDto, GetListRankingError>> {

    // 入力値の制約チェック
    const { tags, sort, page, ...condition } = query;
    const input = Result.combineWithAllErrors([
      RankingSort.create(sort).mapErr((error): GetListRankingInputError => ({ field: "sort", error })),
      RankingListPagination.create(page).mapErr((error): GetListRankingInputError => ({ field: "page", error })),
      Result.combineWithAllErrors(
        tags.map((tag, index) => TagName.create(tag).mapErr((error): GetListRankingInputError => ({ field: `tags.${index}`, error }))),
      ),
      tags.length <= GetListRankingUsecase.MAX_FILTER_TAG_COUNT
        ? ok(undefined)
        : err<undefined, GetListRankingInputError>({ field: "tags", error: { type: "TOO_MANY_FILTER_TAGS", max: GetListRankingUsecase.MAX_FILTER_TAG_COUNT } }),
    ]);
    if (input.isErr()) {
      return err({ type: "INVALID_INPUT", errors: input.error.flat() });
    }
    const [rankingSort, pagination, tagNames] = input.value;
    const rankingQuery = { ...condition, tagNames, sort: rankingSort, pagination };

    const [list, total] = await Promise.all([
      this.repository.findAll(userId, rankingQuery, GetListRankingUsecase.PAGE_SIZE),
      this.repository.count(userId, rankingQuery),
    ]);
    const totalPages = Math.ceil(total / GetListRankingUsecase.PAGE_SIZE);
    return ok(new GetListRankingResultDto(list, total, totalPages));
  }
}
