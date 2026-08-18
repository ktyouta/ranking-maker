import { err, ok, Result } from "neverthrow";
import { ContentModerationDomainService, ContentModerationViolation, ICreateMyRankingRepository, ItemMemo, ItemName, Order, PublicStatus, RankingAggregate, RankingId, RankingMemo, RankingOrderEntity, RankingOrderId, RankingTitle, RankingTitleUniquenessDomainService } from "../../../domain";
import { UserId } from "../../../domain/user";
import { CreateMyRankingSchemaType } from "../../../presentation/my-ranking/schema";
import { Violation } from "../../../util";

export type CreateMyRankingError =
  | { type: "DUPLICATE_TITLE" }
  | { type: "VALIDATION"; violations: Violation[] }
  | { type: "INAPPROPRIATE_CONTENT"; violations: ContentModerationViolation[] };

type PropsType = {
  userId: UserId;
  body: CreateMyRankingSchemaType;
}

/**
 * ランキング作成ユースケース
 */
export class CreateMyRankingUsecase {
  constructor(private readonly repository: ICreateMyRankingRepository,
    private readonly uniquenessService: RankingTitleUniquenessDomainService,
    private readonly contentModerationService: ContentModerationDomainService,
  ) { }

  /**
   * ランキング作成
   */
  async execute({ userId, body }: PropsType): Promise<Result<RankingAggregate, CreateMyRankingError>> {

    const rankingId = RankingId.generate();
    const rankingTitle = new RankingTitle(body.title);
    // タイトル重複（rankingId は未使用の新規 ID のため自己除外は実質的に無効）
    if (await this.uniquenessService.isDuplicated({ userId, rankingTitle, rankingId })) {
      return err({ type: "DUPLICATE_TITLE" });
    }

    // ランキング集約
    const aggregateResult = RankingAggregate.create({
      rankingId,
      rankingTitle,
      publicStatus: new PublicStatus(body.publicStatus),
      memo: new RankingMemo(body.memo),
      userId,
      rankingOrderEntityList: body.items.map((e) => {
        return new RankingOrderEntity(
          RankingOrderId.generate(),
          new ItemName(e.itemName),
          new Order(e.order),
          new ItemMemo(e.memo),
        )
      })
    });

    // 集約時エラー
    if (aggregateResult.isErr()) {
      return err({ type: "VALIDATION", violations: aggregateResult.error });
    }

    const rankingAggrigate = aggregateResult.value;

    // 不適切内容チェック
    const moderationViolations = await this.contentModerationService.moderate(rankingAggrigate);
    if (moderationViolations.length > 0) {
      return err({ type: "INAPPROPRIATE_CONTENT", violations: moderationViolations });
    }

    // ランキング作成
    await this.repository.createRanking(rankingAggrigate);

    return ok(rankingAggrigate);
  }
}
