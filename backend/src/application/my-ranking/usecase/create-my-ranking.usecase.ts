import { err, ok, Result } from "neverthrow";
import { ItemMemo, ItemName, Order, PublicStatus, RankingAggregate, RankingId, RankingMemo, RankingOrderEntity, RankingOrderId, RankingTitle } from "../../../domain";
import { ICreateMyRankingRepository } from "../../../domain/my-ranking/repository/create-my-ranking.repository.interface";
import { UserId } from "../../../domain/user";
import { CreateMyRankingSchemaType } from "../../../presentation/my-ranking/schema";
import { Violation } from "../../../util";

export type CreateMyRankingError =
  | { type: "DUPLICATE_TITLE" }
  | { type: "VALIDATION"; violations: Violation[] };

type PropsTYpe = {
  userId: UserId;
  body: CreateMyRankingSchemaType;
}

/**
 * ランキング作成ユースケース
 */
export class CreateMyRankingUsecase {
  constructor(private readonly repository: ICreateMyRankingRepository) { }

  /**
   * ランキング作成
   */
  async execute({ userId, body }: PropsTYpe): Promise<Result<RankingAggregate, CreateMyRankingError>> {

    const rankingTitle = new RankingTitle(body.title);
    // 同名ランキングの取得（在れば重複）
    const ranking = await this.repository.findRanking(userId, rankingTitle);

    // タイトル重複
    if (ranking.length > 0) {
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
    await this.repository.createRanking(rankingAggrigate);

    return ok(rankingAggrigate);
  }
}
