import { err, ok, Result } from "neverthrow";
import { ContentModerationDomainService, ContentModerationTarget, IconValidityDomainService, ItemMemo, ItemName, IUpdateMyRankingRepository, Order, PublicStatus, RankingValidationError, RankingIcon, RankingId, RankingMemo, RankingOrderEntity, RankingOrderId, RankingTagEntity, RankingTagId, RankingTitle, RankingTitleUniquenessDomainService, TagId, TagName, TagResolutionDomainService, TagUsageDomainService } from "../../../domain";
import { UserId } from "../../../domain/shared";
import { UpdateMyRankingResultDto } from "../dto";

export type UpdateMyRankingError =
  | { type: "DUPLICATE_TITLE" }
  | { type: "NOT_FOUND" }
  | { type: "INVALID_ICON" }
  | { type: "VALIDATION"; errors: RankingValidationError[] }
  | { type: "INAPPROPRIATE_CONTENT"; targets: ContentModerationTarget[] };

type UpdateMyRankingBody = {
  title: string;
  publicStatus: number;
  icon: number;
  memo: string;
  items: { itemName: string; order: number; memo: string }[];
  tags: string[];
};

type PropsType = {
  userId: UserId;
  rankingId: RankingId;
  body: UpdateMyRankingBody;
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
   */
  async execute({ userId, rankingId, body }: PropsType): Promise<Result<UpdateMyRankingResultDto, UpdateMyRankingError>> {

    // 更新前のランキング取得（他ユーザーのものは取得できないため所有権も担保する）
    const currentRanking = await this.repository.findRanking(userId, rankingId);
    if (!currentRanking) {
      return err({ type: "NOT_FOUND" });
    }

    // タイトル重複（自身は除外し、他の同名ランキングのみ検出する）
    const rankingTitle = new RankingTitle(body.title);
    if (await this.uniquenessService.isDuplicated({ userId, rankingTitle, rankingId })) {
      return err({ type: "DUPLICATE_TITLE" });
    }

    // アイコンの実在・有効性チェック（icon_master が唯一の真実源のため、値オブジェクトではなくここで判定する）
    const icon = new RankingIcon(body.icon);
    if (!(await this.iconValidityService.isValid(icon))) {
      return err({ type: "INVALID_ICON" });
    }

    // タグ名を既存タグ・新規タグに解決
    const { tags, newTags } = await this.tagResolutionService.resolve({
      userId,
      tagNames: body.tags.map((e) => new TagName(e)),
    });

    // ランキング更新（集約）
    const updateResult = currentRanking.update({
      rankingTitle,
      publicStatus: new PublicStatus(body.publicStatus),
      icon,
      memo: new RankingMemo(body.memo),
      rankingOrderEntityList: body.items.map((e) => {
        return new RankingOrderEntity(
          RankingOrderId.generate(),
          new ItemName(e.itemName),
          new Order(e.order),
          new ItemMemo(e.memo),
          false,
        )
      }),
      rankingTagEntityList: tags.map((e) => new RankingTagEntity(RankingTagId.generate(), TagId.of(e.id), false)),
    });

    // 集約時エラー
    if (updateResult.isErr()) {
      return err({ type: "VALIDATION", errors: updateResult.error });
    }

    const { ranking, releasedTagIds } = updateResult.value;

    // 不適切内容チェック
    const inappropriateTargets = await this.contentModerationService.moderate(ranking, newTags);
    if (inappropriateTargets.length > 0) {
      return err({ type: "INAPPROPRIATE_CONTENT", targets: inappropriateTargets });
    }

    // 手放したタグのうち、どのランキングにも紐づかなくなるタグ
    const unusedTagIds = await this.tagUsageService.findUnused({ userId, rankingId, releasedTagIds });

    // ランキング更新
    await this.repository.updateRanking(ranking, newTags, unusedTagIds);

    return ok(new UpdateMyRankingResultDto(ranking));
  }
}
