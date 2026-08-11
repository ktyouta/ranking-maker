import { err, ok, Result } from "neverthrow";
import { ItemMemo, ItemName, Order, PublicStatus, RankingAggregate, RankingId, RankingMemo, RankingOrderEntity, RankingOrderId, RankingTitle, RankingTitleUniquenessDomainService } from "../../../domain";
import { ICreateMyRankingRepository } from "../../../domain/my-ranking/repository/create-my-ranking.repository.interface";
import { UserId } from "../../../domain/user";
import { CreateMyRankingSchemaType } from "../../../presentation/my-ranking/schema";
import { Violation } from "../../../util";

export type CreateMyRankingError =
  | { type: "DUPLICATE_TITLE" }
  | { type: "VALIDATION"; violations: Violation[] };

type PropsType = {
  userId: UserId;
  body: CreateMyRankingSchemaType;
}

/**
 * ランキング作成ユースケース
 */
export class CreateMyRankingUsecase {
  constructor(private readonly createMyRankingRepository: ICreateMyRankingRepository,
    private readonly uniquenessService: RankingTitleUniquenessDomainService,
  ) { }

  /**
   * ランキング作成
   */
  async execute({ userId, body }: PropsType): Promise<Result<RankingAggregate, CreateMyRankingError>> {

    const rankingTitle = new RankingTitle(body.title);
    // タイトル重複
    if (await this.uniquenessService.isDuplicated({ userId, rankingTitle })) {
      return err({ type: "DUPLICATE_TITLE" });
    }

    // ランキング集約
    const aggregateResult = RankingAggregate.create({
      rankingId: RankingId.generate(),
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

    if (aggregateResult.isErr()) {
      return err({ type: "VALIDATION", violations: aggregateResult.error });
    }

    const rankingAggrigate = aggregateResult.value;
    // ランキング作成
    await this.createMyRankingRepository.createRanking(rankingAggrigate);

    return ok(rankingAggrigate);
  }
}
