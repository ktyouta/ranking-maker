# ランキングお気に入り機能（favorite-ranking）実装計画

## 実装状況

バックエンド（#1〜#14）・フロントエンド（#15〜#26）すべて実装完了。実装中に判明した差分:
- タスク#25（`MyRankingContainer`／`MyRankingDetailViewContainer` の修正）は行わなかった。両Containerとも hooks の戻り値をそのまま `{...props}`／`{...view}` で子コンポーネントに渡す既存構造だったため、`onToggleFavorite`（一覧）・`isFavorite`/`onToggleFavorite`（詳細）を `use-my-ranking-list.ts`／`use-my-ranking-detail-view.ts` の戻り値に追加するだけで自動的に伝播した
- レビュー完了後、ユーザーから「PUT/DELETEに分ける必要はなく、PUTだけでよいのでは」との指摘を受け、エンドポイントを `PUT /api/v1/my-ranking/:rankingId/favorite`（リクエストボディ `{ isFavorite: boolean }`）の1本に統合した（設計判断4を参照）。これに伴い `UpdateFavoriteMyRankingSchema` を新規追加し、Controller・フロントAPIから重複していた認証/所有権確認コードの重複ブロックを解消した

## 前提・確定した仕様

ユーザーへの確認により以下を確定：

- お気に入りの対象は「自分のランキング」（`my-ranking` ドメイン）のみ。`ranking`（公開一覧・home画面）は現状使われておらず対象外。
- お気に入りボタンは「マイランキング一覧」のカード右上と、「ランキング詳細画面」に配置する。
- お気に入りのみの絞り込みは、既存の「詳細フィルター」（`MyRankingSearchBar` の登録日・更新日フィルターと同じ場所）にチェックボックスを追加する形で実現する。新規のお気に入り一覧画面は作らない。

## 設計判断

### 1. データモデル：中間テーブルを作らず `ranking_master` に列追加する

**選択肢A（採用）**: `ranking_master.is_favorite` に boolean 列を追加する
- メリット: お気に入りは常に「所有者本人が自分のランキングに付ける印」であり、ranking:user は 1:1（既に `ranking_master.userId` で所有者が確定している）。中間テーブルを作る必然性がない。
- デメリット: 将来「他人の公開ランキングを誰でもお気に入り登録できる」機能（多対多）に拡張する場合、`favorite_master`（ranking_id + user_id の複合ユニーク）テーブルへの移行が必要になる。

**選択肢B（不採用）**: `ranking_id + user_id` の中間テーブル（`favorite_master`）を新設する
- メリット: 多対多に最初から対応できる。
- デメリット: 現時点でユーザーから明示的に「対象は自分のランキングのみ、home機能は使わない」と指示されており、多対多になるケースが存在しない。存在しない要件のためだけにテーブル・ドメイン層を増やすのは過剰設計。

→ **選択肢Aを採用**。ユーザーが公開ランキングへのお気に入りを望んだ時点で選択肢Bへの移行を検討する。

### 2. ドメイン設計：集約を経由しない（`soft-delete-my-ranking` と同じパターン）

`update-my-ranking`（全置換更新）や `restore-my-ranking`（タイトル重複再検証あり）は `RankingAggregate` を再構築して不変条件を検証するが、お気に入りフラグの ON/OFF には検証すべき不変条件がない（`deleteFlg` の反転＝`soft-delete-my-ranking`/`restore-my-ranking` も同様の理由で `soft-delete` 側は集約を使っていない）。
そのため、お気に入り機能も **所有権確認 → 直接UPDATE** という `soft-delete-my-ranking.usecase.ts` と同じ最小構成にする。集約や新規値オブジェクトは作らない。

### 3. Usecase・Controller・フロントAPI：登録・解除を1本化する（impl-plannerレビューを受けて確定）

登録も解除も「所有権確認 → `is_favorite` を指定値に更新」という同一の操作であり、値が真か偽かの違いでしかないため、Usecase・Repository・Controller・フロントAPIのすべてを1本化する（バックだけController2ファイルに分けフロントは1ファイルにする、という非対称な設計は避ける）。

- Repository interface: `IUpdateFavoriteMyRankingRepository`（1つ）
- Usecase: `UpdateFavoriteMyRankingUsecase.execute(userId, rankingId, isFavorite: boolean)`（1つ）
- Controller: `favorite-my-ranking.controller.ts`（1ファイルに PUT/DELETE 両ルートを登録し、どちらも同じ Usecase を `isFavorite` の値だけ変えて呼ぶ）
- フロントAPI: `toggle-my-ranking-favorite.ts`（1ファイル、`isFavorite` に応じて PUT/DELETE を呼び分け）

`soft-delete`/`restore` が別クラス・別ファイルなのは「削除」と「（タイトル重複再検証を伴う）復元」という非対称な操作だからであり、完全に対称なお気に入りの登録/解除にそのパターンを機械的に踏襲する必要はない。

### 4. エンドポイント（ユーザー指摘によりPUT1本に統合、確定版）

- `PUT /api/v1/my-ranking/:rankingId/favorite`（body: `{ isFavorite: boolean }`）… お気に入り登録・解除の両方をこの1エンドポイントで扱う
  - 当初 `PUT`（登録）/`DELETE`（解除）の2ルートで設計したが、ユーザーから「Controller内の処理（認証確認・所有権確認・Usecase呼び出し）がほぼ丸ごと重複するだけなので、PUT1本でよいのでは」との指摘を受け、`isFavorite` をボディで受け取るPUT1本に統合した
  - GitHubのstar APIのような「PUT=登録／DELETE=解除（ボディなし）」も一般的なREST表現だが、今回は既存Controllerの重複コード解消を優先しPUT1本化を採用した
- 一覧・詳細取得の既存レスポンスに `isFavorite: boolean` を追加する
- 一覧取得のクエリに `favoriteOnly` を追加し、`true` のときのみ絞り込む。既存の `page` パラメータ（`z.preprocess` + `z.coerce.number()`）と同様、文字列→boolean変換は **スキーマ層で完結** させる：
  ```ts
  favoriteOnly: z.string().optional().transform((v) => v === "true"),
  ```
  これにより `MyRankingQueryType.favoriteOnly` はそのまま `boolean` 型として扱える（controller/usecase側に文字列判定処理を持ち込まない）。

## この設計が破綻するケース

- 将来「他ユーザーの公開ランキングをお気に入り登録できる」要件が追加された場合、`is_favorite` 列方式では対応できず、`favorite_master`（中間テーブル）への移行と `ranking` ドメイン側への機能追加が必要になる。

---

## バックエンド タスク

| # | タスク | ファイル | レイヤー | 操作 | 前提 |
|---|--------|----------|------|------|------|
| 1 | `ranking_master` に `is_favorite`（boolean, default false）列追加 | `backend/src/infrastructure/db/schema.ts` | Infrastructure | 修正 | ― |
| 2 | マイグレーション生成（`npm run db:generate`） | `backend/drizzle/*.sql` | ― | 生成 | #1 |
| 3 | `MyRankingListType` / `MyRankingQueryType` に `isFavorite` / `favoriteOnly` 追加 | `backend/src/domain/my-ranking/repository/get-list-my-ranking.repository.interface.ts` | Domain | 修正 | ― |
| 4 | `MyRankingType` に `isFavorite` 追加 | `backend/src/domain/my-ranking/repository/get-my-ranking.repository.interface.ts` | Domain | 修正 | ― |
| 5 | `IUpdateFavoriteMyRankingRepository` interface 新設 | `backend/src/domain/my-ranking/repository/update-favorite-my-ranking.repository.interface.ts` | Domain | 新規 | ― |
| 6 | `GetListMyRankingRepository` の SELECT に `isFavorite` 追加、`buildConditions` に `favoriteOnly` 条件追加 | `backend/src/infrastructure/my-ranking/repository/get-list-my-ranking.repository.ts` | Infrastructure | 修正 | #1, #3 |
| 7 | `GetMyRankingRepository` の SELECT に `isFavorite` 追加 | `backend/src/infrastructure/my-ranking/repository/get-my-ranking.repository.ts` | Infrastructure | 修正 | #1, #4 |
| 8 | `UpdateFavoriteMyRankingRepository` 実装（`findRanking` で所有権確認、`updateFavorite(rankingId, isFavorite)` でUPDATE） | `backend/src/infrastructure/my-ranking/repository/update-favorite-my-ranking.repository.ts` | Infrastructure | 新規 | #1, #5 |
| 9 | `UpdateFavoriteMyRankingUsecase.execute(userId, rankingId, isFavorite)` 実装 | `backend/src/application/my-ranking/usecase/update-favorite-my-ranking.usecase.ts` | Application | 新規 | #5 |
| 10 | `GetListMyRankingQuerySchema` に `favoriteOnly: z.string().optional().transform((v) => v === "true")` 追加（スキーマ層でboolean化） | `backend/src/presentation/my-ranking/schema/get-list-my-ranking.schema.ts` | Presentation | 修正 | ― |
| 10a | `UpdateFavoriteMyRankingSchema`（`{ isFavorite: boolean }`）新設 | `backend/src/presentation/my-ranking/schema/update-favorite-my-ranking.schema.ts` | Presentation | 新規 | ― |
| 11 | `favorite-my-ranking.controller.ts`（`PUT /api/v1/my-ranking/:rankingId/favorite` 1ルートのみ。bodyの `isFavorite` をそのまま `UpdateFavoriteMyRankingUsecase` に渡す） | `backend/src/presentation/my-ranking/controller/favorite-my-ranking.controller.ts` | Presentation | 新規 | #9, #10a |
| 12 | ルーター登録 | `backend/src/presentation/my-ranking/controller/my-ranking.controller.ts` | Presentation | 修正 | #11 |
| 13 | `API_ENDPOINT.MY_RANKING_ID_FAVORITE` 追加 | `backend/src/constant/api-endpoint.const.ts` | ― | 修正 | ― |
| 14 | 各 index.ts のエクスポート追加（domain/application/infrastructure） | `backend/src/domain/my-ranking/repository/index.ts` 他 | ― | 修正 | #5, #8, #9 |

## フロントエンド タスク

| # | タスク | ファイル | 前提 |
|---|--------|----------|------|
| 15 | `MyRankingSearchFilter` に `favoriteOnly: boolean` 追加 | `frontend/src/features/my-ranking/types/my-ranking-search-filter.ts` | ― |
| 16 | `MY_RANKING_QUERY_KEY.FAVORITE_ONLY` 追加 | `frontend/src/features/my-ranking/constants/my-ranking-query-params.ts` | ― |
| 17 | お気に入り登録/解除 mutation hook（`PUT` 1本に body `{ isFavorite }` を渡して呼び出す） | `frontend/src/features/my-ranking/api/toggle-my-ranking-favorite.ts` | バックエンド#11 |
| 18 | `useMyRankings` のクエリに `favoriteOnly` 追加 | `frontend/src/features/my-ranking/api/get-my-rankings.ts` | バックエンド#6 |
| 19 | `useMyRankingList` に `favoriteOnly` の状態・トグル実行・成功時invalidate処理を追加 | `frontend/src/features/my-ranking/hooks/use-my-ranking-list.ts` | #15, #16, #17, #18 |
| 20 | `useMyRankingDetailView` にお気に入りトグル実行・invalidate処理を追加 | `frontend/src/features/my-ranking/hooks/use-my-ranking-detail-view.ts` | #17 |
| 21 | `RankingCard` に `isFavorite` / `onToggleFavorite` props と★ボタン追加（`e.stopPropagation()` でカード遷移と分離） | `frontend/src/features/my-ranking/components/ranking-card.tsx` | ― |
| 22 | `MyRanking` から `RankingCard` へ `isFavorite`/`onToggleFavorite` 受け渡し | `frontend/src/features/my-ranking/components/my-ranking.tsx` | #21 |
| 23 | `MyRankingSearchBar` の詳細フィルターに「お気に入りのみ表示」チェックボックス追加。`activeCount`／`isEmpty` の判定にも `favoriteOnly` を反映する | `frontend/src/features/my-ranking/components/my-ranking-search-bar.tsx` | ― |
| 24 | `MyRankingDetailView` に★トグルボタン追加（メモ・削除ボタンと同じ並びに配置） | `frontend/src/features/my-ranking/components/my-ranking-detail-view.tsx` | ― |
| 25 | `MyRankingContainer`／`MyRankingDetailViewContainer` でトグルハンドラを配線 | `frontend/src/features/my-ranking/components/my-ranking-container.tsx` `frontend/src/features/my-ranking/components/my-ranking-detail-view-container.tsx` | #19, #20 |
| 26 | 既存テストの更新（★追加によるスナップショット的崩れがないか確認、必要なら `isFavorite`/`onToggleFavorite` のデフォルト値・トグル呼び出しの検証を追加） | `frontend/src/features/my-ranking/components/ranking-card.test.tsx` `frontend/src/features/my-ranking/components/my-ranking-detail-view.test.tsx` | #21, #24 |

合計: 26 タスク（バックエンド 14 / フロントエンド 12）
推奨着手順: #1 → #2 → #3, #4, #5 → #6, #7, #8 → #9 → #10 → #11 → #12 → #13 → #14 → #15, #16 → #17, #18 → #19, #20 → #21, #23, #24 → #22 → #25 → #26
