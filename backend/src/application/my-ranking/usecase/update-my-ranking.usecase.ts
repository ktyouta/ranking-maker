import { err, ok, Result } from "neverthrow";
import { ItemMemo, ItemName, IUpdateMyRankingRepository, Order, PublicStatus, RankingAggregate, RankingId, RankingMemo, RankingOrderEntity, RankingOrderId, RankingTitle, RankingTitleUniquenessDomainService } from "../../../domain";
import { UserId } from "../../../domain/user";
import { UpdateMyRankingSchemaType } from "../../../presentation/my-ranking/schema";
import { Violation } from "../../../util";

export type UpdateMyRankingError =
  | { type: "DUPLICATE_TITLE" }
  | { type: "NOT_FOUND" }
  | { type: "VALIDATION"; violations: Violation[] };

type PropsType = {
  userId: UserId;
  rankingId: RankingId;
  body: UpdateMyRankingSchemaType;
}

/**
 * ランキング更新ユースケース
 */
export class UpdateMyRankingUsecase {
  constructor(private readonly repository: IUpdateMyRankingRepository,
    private readonly uniquenessService: RankingTitleUniquenessDomainService,
  ) { }

  /**
   * ランキング更新
   */
  async execute({ userId, rankingId, body }: PropsType): Promise<Result<RankingAggregate, UpdateMyRankingError>> {

    // ランキング存在チェック（他ユーザーのものは取得できないため所有権も担保する）
    const result = await this.repository.findRanking(userId, rankingId);
    if (result.length === 0) {
      return err({ type: "NOT_FOUND" });
    }

    // タイトル重複（自身は除外し、他の同名ランキングのみ検出する）
    const rankingTitle = new RankingTitle(body.title);
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
    // ランキング更新
    await this.repository.updateRanking(rankingAggrigate);

    return ok(rankingAggrigate);
  }
}
