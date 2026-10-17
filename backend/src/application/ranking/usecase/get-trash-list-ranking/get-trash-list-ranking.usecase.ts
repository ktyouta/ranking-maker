import { err, ok, Result } from "neverthrow";
import { type IGetTrashListRankingRepository, RankingAggregate, RankingListPagination, type RankingListPaginationError, TagName, type TagNameError, TrashRankingSort, type TrashRankingSortError } from "../../../../domain";
import { UserId } from "../../../../domain/shared";
import { GetTrashListRankingResultDto } from "../../dto";

/**
 * ゴミ箱のランキング一覧取得の入力値の制約違反（field は入力値の項目名。タグは `tags.{タグの添字}`、タグの件数超過は `tags`）
 */
export type GetTrashListRankingInputError =
  | { field: "sort"; error: TrashRankingSortError }
  | { field: "page"; error: RankingListPaginationError }
  | { field: `tags.${number}`; error: TagNameError }
  | { field: "tags"; error: { type: "TOO_MANY_FILTER_TAGS"; max: number } };

export type GetTrashListRankingError = { type: "INVALID_INPUT"; errors: GetTrashListRankingInputError[] };

/**
 * updatedAtFrom/updatedAtTo は削除日時に転用した updatedAt の範囲を表す
 */
type GetTrashListRankingQuery = {
  keyword?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  updatedAtFrom?: string;
  updatedAtTo?: string;
  tags: string[];
  sort?: string;
  page?: number;
};

type PropsType = {
  userId: UserId;
  query: GetTrashListRankingQuery;
}

/**
 * ゴミ箱のランキング一覧取得ユースケース
 */
export class GetTrashListRankingUsecase {

  // 1ページあたりの最大取得件数
  static readonly PAGE_SIZE = 30;
  // 1ランキングに付けられるタグの上限を超えて指定しても必ず0件になるため、同じ上限で制限する
  static readonly MAX_FILTER_TAG_COUNT = RankingAggregate.MAX_TAG_COUNT;

  constructor(private readonly repository: IGetTrashListRankingRepository) { }

  /**
   * 削除済み一覧取得（ページング・絞り込み対応）
   * @param userId ランキングを所有するユーザーID
   * @param query 絞り込み・並び順・ページ番号の条件
   * @returns 成功時は指定ページの削除済みランキング一覧・全件数・総ページ数。
   * 入力値が制約を満たさない場合は INVALID_INPUT（違反はすべて返し、一覧・件数は問い合わせない）
   */
  async execute({ userId, query }: PropsType): Promise<Result<GetTrashListRankingResultDto, GetTrashListRankingError>> {

    // 入力値の制約チェック
    const { tags, sort, page, ...condition } = query;
    const input = Result.combineWithAllErrors([
      TrashRankingSort.create(sort).mapErr((error): GetTrashListRankingInputError => ({ field: "sort", error })),
      RankingListPagination.create(page).mapErr((error): GetTrashListRankingInputError => ({ field: "page", error })),
      Result.combineWithAllErrors(
        tags.map((tag, index) => TagName.create(tag).mapErr((error): GetTrashListRankingInputError => ({ field: `tags.${index}`, error }))),
      ),
      tags.length <= GetTrashListRankingUsecase.MAX_FILTER_TAG_COUNT
        ? ok(undefined)
        : err<undefined, GetTrashListRankingInputError>({ field: "tags", error: { type: "TOO_MANY_FILTER_TAGS", max: GetTrashListRankingUsecase.MAX_FILTER_TAG_COUNT } }),
    ]);
    if (input.isErr()) {
      return err({ type: "INVALID_INPUT", errors: input.error.flat() });
    }
    const [trashRankingSort, pagination, tagNames] = input.value;
    const trashQuery = { ...condition, tagNames, sort: trashRankingSort, pagination };

    const [list, total] = await Promise.all([
      this.repository.findAll(userId, trashQuery, GetTrashListRankingUsecase.PAGE_SIZE),
      this.repository.count(userId, trashQuery),
    ]);
    const totalPages = Math.ceil(total / GetTrashListRankingUsecase.PAGE_SIZE);
    return ok(new GetTrashListRankingResultDto(list, total, totalPages));
  }
}
