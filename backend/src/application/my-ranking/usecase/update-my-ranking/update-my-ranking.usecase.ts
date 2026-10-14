import { err, ok, Result } from "neverthrow";
import { ContentModerationDomainService, ContentModerationTarget, IconValidityDomainService, ItemMemo, type ItemMemoError, ItemName, type ItemNameError, type IUpdateMyRankingRepository, Order, type OrderError, PublicStatus, type PublicStatusError, type RankingValidationError, RankingIcon, type RankingIconError, RankingId, RankingMemo, type RankingMemoError, RankingOrderEntity, RankingOrderId, RankingTagEntity, RankingTagId, RankingTitle, type RankingTitleError, RankingTitleUniquenessDomainService, TagId, TagName, type TagNameError, TagResolutionDomainService, TagUsageDomainService } from "../../../../domain";
import { UserId } from "../../../../domain/shared";
import { UpdateMyRankingResultDto } from "../../dto";

/**
 * ランキング更新の入力値の制約違反（field は入力値の項目名。項目は `items.{項目の添字}.{項目名}`、タグは `tags.{タグの添字}`）
 */
export type UpdateMyRankingInputError =
  | { field: "title"; error: RankingTitleError }
  | { field: "publicStatus"; error: PublicStatusError }
  | { field: "icon"; error: RankingIconError }
  | { field: "memo"; error: RankingMemoError }
  | { field: `items.${number}.itemName`; error: ItemNameError }
  | { field: `items.${number}.order`; error: OrderError }
  | { field: `items.${number}.memo`; error: ItemMemoError }
  | { field: `tags.${number}`; error: TagNameError };

export type UpdateMyRankingError =
  | { type: "INVALID_INPUT"; errors: UpdateMyRankingInputError[] }
  | { type: "DUPLICATE_TITLE" }
  | { type: "NOT_FOUND" }
  | { type: "INVALID_ICON" }
  | { type: "VALIDATION"; errors: RankingValidationError[] }
  | { type: "INAPPROPRIATE_CONTENT"; targets: ContentModerationTarget[] };

type UpdateMyRankingItemBody = { itemName: string; order: number; memo: string };

type UpdateMyRankingBody = {
  title: string;
  publicStatus: number;
  icon: number;
  memo: string;
  items: UpdateMyRankingItemBody[];
  tags: string[];
};

type PropsType = {
  userId: UserId;
  rankingId: string;
  body: UpdateMyRankingBody;
}

/**
 * 項目1件分の入力値から、項目の値オブジェクトを生成する
 * @param item 項目の入力値
 * @param index 項目の添字（制約違反の項目名に使う）
 * @returns 成功時は項目の値オブジェクト、制約違反時は違反の一覧（すべて収集する）
 */
function createItemParam(item: UpdateMyRankingItemBody, index: number) {
  return Result.combineWithAllErrors([
    ItemName.create(item.itemName).mapErr((error): UpdateMyRankingInputError => ({ field: `items.${index}.itemName`, error })),
    Order.create(item.order).mapErr((error): UpdateMyRankingInputError => ({ field: `items.${index}.order`, error })),
    ItemMemo.create(item.memo).mapErr((error): UpdateMyRankingInputError => ({ field: `items.${index}.memo`, error })),
  ]).map(([itemName, order, memo]) => ({ itemName, order, memo }));
}

/**
 * ランキング更新ユースケース
 */
export class UpdateMyRankingUsecase {
  constructor(private readonly repository: IUpdateMyRankingRepository,
    private readonly uniquenessService: RankingTitleUniquenessDomainService,
    private readonly contentModerationService: ContentModerationDomainService,
    private readonly iconValidityService: IconValidityDomainService,
    private readonly tagResolutionService: TagResolutionDomainService,
    private readonly tagUsageService: TagUsageDomainService,
  ) { }

  /**
   * ランキング更新
   * @param userId ランキングを所有するユーザーID
   * @param rankingId 更新対象のランキングID
   * @param body ランキングの更新内容
   * @returns 成功時は更新後のランキングの DTO。
   * 入力値が制約を満たさない（違反はすべて返し、DB は問い合わせない）・ランキングが存在しない・同名ランキングが存在する（自身を除く）・
   * アイコンが無効・ランキングが不変条件に違反する・不適切な内容を含む場合はエラー（いずれも保存しない）
   * @throws rankingId が空の場合（DB は問い合わせない）
   */
  async execute({ userId, rankingId, body }: PropsType): Promise<Result<UpdateMyRankingResultDto, UpdateMyRankingError>> {
    const id = RankingId.of(rankingId);

    // 入力値の制約チェック
    const input = Result.combineWithAllErrors([
      RankingTitle.create(body.title).mapErr((error): UpdateMyRankingInputError => ({ field: "title", error })),
      PublicStatus.create(body.publicStatus).mapErr((error): UpdateMyRankingInputError => ({ field: "publicStatus", error })),
      RankingIcon.create(body.icon).mapErr((error): UpdateMyRankingInputError => ({ field: "icon", error })),
      RankingMemo.create(body.memo).mapErr((error): UpdateMyRankingInputError => ({ field: "memo", error })),
      Result.combineWithAllErrors(body.items.map(createItemParam)).mapErr((errors) => errors.flat()),
      Result.combineWithAllErrors(
        body.tags.map((tag, index) => TagName.create(tag).mapErr((error): UpdateMyRankingInputError => ({ field: `tags.${index}`, error }))),
      ),
    ]);
    if (input.isErr()) {
      return err({ type: "INVALID_INPUT", errors: input.error.flat() });
    }
    const [rankingTitle, publicStatus, icon, memo, items, tagNames] = input.value;

    // 更新前のランキング取得（他ユーザーのものは取得できないため所有権も担保する）
    const ranking = await this.repository.findRanking(userId, id);
    if (!ranking) {
      return err({ type: "NOT_FOUND" });
    }

    // タイトル重複（自身は除外し、他の同名ランキングのみ検出する）
    if (await this.uniquenessService.isDuplicated({ userId, rankingTitle, rankingId: id })) {
      return err({ type: "DUPLICATE_TITLE" });
    }

    // アイコンの実在・有効性チェック（icon_master が唯一の真実源のため、値オブジェクトではなくここで判定する）
    if (!(await this.iconValidityService.isValid(icon))) {
      return err({ type: "INVALID_ICON" });
    }

    // タグ名を既存タグ・新規タグに解決
    const { tags, newTags } = await this.tagResolutionService.resolve({ userId, tagNames });

    // ランキング更新（集約）
    const updateResult = ranking.update({
      rankingTitle,
      publicStatus,
      icon,
      memo,
      rankingOrderEntityList: items.map((e) => new RankingOrderEntity(RankingOrderId.generate(), e.itemName, e.order, e.memo, false)),
      rankingTagEntityList: tags.map((e) => new RankingTagEntity(RankingTagId.generate(), TagId.of(e.id), false)),
    });

    // 集約時エラー
    if (updateResult.isErr()) {
      return err({ type: "VALIDATION", errors: updateResult.error });
    }

    const releasedTagIds = updateResult.value;

    // 不適切内容チェック
    const inappropriateTargets = await this.contentModerationService.moderate(ranking, newTags);
    if (inappropriateTargets.length > 0) {
      return err({ type: "INAPPROPRIATE_CONTENT", targets: inappropriateTargets });
    }

    // 手放したタグのうち、どのランキングにも紐づかなくなるタグ
    const unusedTagIds = await this.tagUsageService.findUnused({ userId, rankingId: id, releasedTagIds });

    // ランキング更新
    await this.repository.updateRanking(ranking, newTags, unusedTagIds);

    return ok(new UpdateMyRankingResultDto(ranking));
  }
}
