import { err, ok, Result } from "neverthrow";
import { ContentModerationDomainService, ContentModerationTarget, ICreateMyRankingRepository, IconValidityDomainService, ItemMemo, ItemName, Order, PublicStatus, RankingAggregate, RankingCreateError, RankingIcon, RankingId, RankingMemo, RankingOrderEntity, RankingOrderId, RankingTitle, RankingTitleUniquenessDomainService } from "../../../domain";
import { UserId } from "../../../domain/shared";
import { CreateMyRankingResultDto } from "../dto";

export type CreateMyRankingError =
  | { type: "DUPLICATE_TITLE" }
  | { type: "INVALID_ICON" }
  | { type: "VALIDATION"; errors: RankingCreateError[] }
  | { type: "INAPPROPRIATE_CONTENT"; targets: ContentModerationTarget[] };

type CreateMyRankingBody = {
  title: string;
  publicStatus: number;
  icon: number;
  memo: string;
  items: { itemName: string; order: number; memo: string }[];
};

type PropsType = {
  userId: UserId;
  body: CreateMyRankingBody;
}

/**
 * ランキング作成ユースケース
 */
export class CreateMyRankingUsecase {
  constructor(private readonly repository: ICreateMyRankingRepository,
    private readonly uniquenessService: RankingTitleUniquenessDomainService,
    private readonly contentModerationService: ContentModerationDomainService,
    private readonly iconValidityService: IconValidityDomainService,
  ) { }

  /**
   * ランキング作成
   */
  async execute({ userId, body }: PropsType): Promise<Result<CreateMyRankingResultDto, CreateMyRankingError>> {

    const rankingId = RankingId.generate();
    const rankingTitle = new RankingTitle(body.title);
    // タイトル重複（rankingId は未使用の新規 ID のため自己除外は実質的に無効）
    if (await this.uniquenessService.isDuplicated({ userId, rankingTitle, rankingId })) {
      return err({ type: "DUPLICATE_TITLE" });
    }

    // アイコンの実在・有効性チェック（icon_master が唯一の真実源のため、値オブジェクトではなくここで判定する）
    const icon = new RankingIcon(body.icon);
    if (!(await this.iconValidityService.isValid(icon))) {
      return err({ type: "INVALID_ICON" });
    }

    // ランキング集約
    const aggregateResult = RankingAggregate.create({
      rankingId,
      rankingTitle,
      publicStatus: new PublicStatus(body.publicStatus),
      icon,
      memo: new RankingMemo(body.memo),
      userId,
      rankingOrderEntityList: body.items.map((e) => {
        return new RankingOrderEntity(
          RankingOrderId.generate(),
          new ItemName(e.itemName),
          new Order(e.order),
          new ItemMemo(e.memo),
          false,
        )
      })
    });

    // 集約時エラー
    if (aggregateResult.isErr()) {
      return err({ type: "VALIDATION", errors: aggregateResult.error });
    }

    const rankingAggrigate = aggregateResult.value;

    // 不適切内容チェック
    const inappropriateTargets = await this.contentModerationService.moderate(rankingAggrigate);
    if (inappropriateTargets.length > 0) {
      return err({ type: "INAPPROPRIATE_CONTENT", targets: inappropriateTargets });
    }

    // ランキング作成
    await this.repository.createRanking(rankingAggrigate);

    return ok(new CreateMyRankingResultDto(rankingAggrigate));
  }
}
