import { err, ok, Result } from "neverthrow";
import { ContentModerationDomainService, ContentModerationTarget, IconValidityDomainService, type ICreateMyRankingRepository, ItemMemo, type ItemMemoError, ItemName, type ItemNameError, Order, type OrderError, PublicStatus, type PublicStatusError, RankingAggregate, type RankingValidationError, RankingIcon, type RankingIconError, RankingId, RankingMemo, type RankingMemoError, RankingOrderEntity, RankingOrderId, RankingTagEntity, RankingTagId, RankingTitle, type RankingTitleError, RankingTitleUniquenessDomainService, TagId, TagName, type TagNameError, TagResolutionDomainService } from "../../../../domain";
import { UserId } from "../../../../domain/shared";
import { CreateMyRankingResultDto } from "../../dto";

/**
 * ランキング作成の入力値の制約違反（field は入力値の項目名。項目は `items.{項目の添字}.{項目名}`、タグは `tags.{タグの添字}`）
 */
export type CreateMyRankingInputError =
  | { field: "title"; error: RankingTitleError }
  | { field: "publicStatus"; error: PublicStatusError }
  | { field: "icon"; error: RankingIconError }
  | { field: "memo"; error: RankingMemoError }
  | { field: `items.${number}.itemName`; error: ItemNameError }
  | { field: `items.${number}.order`; error: OrderError }
  | { field: `items.${number}.memo`; error: ItemMemoError }
  | { field: `tags.${number}`; error: TagNameError };

export type CreateMyRankingError =
  | { type: "INVALID_INPUT"; errors: CreateMyRankingInputError[] }
  | { type: "DUPLICATE_TITLE" }
  | { type: "INVALID_ICON" }
  | { type: "VALIDATION"; errors: RankingValidationError[] }
  | { type: "INAPPROPRIATE_CONTENT"; targets: ContentModerationTarget[] };

type CreateMyRankingItemBody = { itemName: string; order: number; memo: string };

type CreateMyRankingBody = {
  title: string;
  publicStatus: number;
  icon: number;
  memo: string;
  items: CreateMyRankingItemBody[];
  tags: string[];
};

type PropsType = {
  userId: UserId;
  body: CreateMyRankingBody;
}

/**
 * 項目1件分の入力値から、項目の値オブジェクトを生成する
 * @param item 項目の入力値
 * @param index 項目の添字（制約違反の項目名に使う）
 * @returns 成功時は項目の値オブジェクト、制約違反時は違反の一覧（すべて収集する）
 */
function createItemParam(item: CreateMyRankingItemBody, index: number) {
  return Result.combineWithAllErrors([
    ItemName.create(item.itemName).mapErr((error): CreateMyRankingInputError => ({ field: `items.${index}.itemName`, error })),
    Order.create(item.order).mapErr((error): CreateMyRankingInputError => ({ field: `items.${index}.order`, error })),
    ItemMemo.create(item.memo).mapErr((error): CreateMyRankingInputError => ({ field: `items.${index}.memo`, error })),
  ]).map(([itemName, order, memo]) => ({ itemName, order, memo }));
}

/**
 * ランキング作成ユースケース
 */
export class CreateMyRankingUsecase {
  constructor(private readonly repository: ICreateMyRankingRepository,
    private readonly uniquenessService: RankingTitleUniquenessDomainService,
    private readonly contentModerationService: ContentModerationDomainService,
    private readonly iconValidityService: IconValidityDomainService,
    private readonly tagResolutionService: TagResolutionDomainService,
  ) { }

  /**
   * ランキング作成
   * @param userId ランキングを所有するユーザーID
   * @param body ランキングの登録内容
   * @returns 成功時は作成したランキングの DTO。
   * 入力値が制約を満たさない（違反はすべて返し、DB は問い合わせない）・同名ランキングが存在する・アイコンが無効・
   * ランキングが不変条件に違反する・不適切な内容を含む場合はエラー（いずれも保存しない）
   */
  async execute({ userId, body }: PropsType): Promise<Result<CreateMyRankingResultDto, CreateMyRankingError>> {

    // 入力値の制約チェック
    const input = Result.combineWithAllErrors([
      Result.combineWithAllErrors([
        RankingTitle.create(body.title).mapErr((error): CreateMyRankingInputError => ({ field: "title", error })),
        PublicStatus.create(body.publicStatus).mapErr((error): CreateMyRankingInputError => ({ field: "publicStatus", error })),
        RankingIcon.create(body.icon).mapErr((error): CreateMyRankingInputError => ({ field: "icon", error })),
        RankingMemo.create(body.memo).mapErr((error): CreateMyRankingInputError => ({ field: "memo", error })),
      ]),
      Result.combineWithAllErrors(body.items.map(createItemParam)).mapErr((errors) => errors.flat()),
      Result.combineWithAllErrors(
        body.tags.map((tag, index) => TagName.create(tag).mapErr((error): CreateMyRankingInputError => ({ field: `tags.${index}`, error }))),
      ),
    ]);
    if (input.isErr()) {
      return err({ type: "INVALID_INPUT", errors: input.error.flat() });
    }
    const [[rankingTitle, publicStatus, icon, memo], items, tagNames] = input.value;

    const rankingId = RankingId.generate();
    // タイトル重複（rankingId は未使用の新規 ID のため自己除外は実質的に無効）
    if (await this.uniquenessService.isDuplicated({ userId, rankingTitle, rankingId })) {
      return err({ type: "DUPLICATE_TITLE" });
    }

    // アイコンの実在・有効性チェック（icon_master が唯一の真実源のため、値オブジェクトではなくここで判定する）
    if (!(await this.iconValidityService.isValid(icon))) {
      return err({ type: "INVALID_ICON" });
    }

    // タグ名を既存タグ・新規タグに解決
    const { tags, newTags } = await this.tagResolutionService.resolve({ userId, tagNames });

    // ランキング集約
    const aggregateResult = RankingAggregate.create({
      rankingId,
      rankingTitle,
      publicStatus,
      icon,
      memo,
      userId,
      rankingOrderEntityList: items.map((e) => new RankingOrderEntity(RankingOrderId.generate(), e.itemName, e.order, e.memo, false)),
      rankingTagEntityList: tags.map((e) => new RankingTagEntity(RankingTagId.generate(), TagId.of(e.id), false)),
    });

    // 集約時エラー
    if (aggregateResult.isErr()) {
      return err({ type: "VALIDATION", errors: aggregateResult.error });
    }

    const rankingAggrigate = aggregateResult.value;

    // 不適切内容チェック
    const inappropriateTargets = await this.contentModerationService.moderate(rankingAggrigate, newTags);
    if (inappropriateTargets.length > 0) {
      return err({ type: "INAPPROPRIATE_CONTENT", targets: inappropriateTargets });
    }

    // ランキング作成
    await this.repository.createRanking(rankingAggrigate, newTags);

    return ok(new CreateMyRankingResultDto(rankingAggrigate));
  }
}
