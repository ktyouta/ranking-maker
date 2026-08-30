# ゴミ箱画面（trash）実装計画

## 前提

- バックエンドは既に「ゴミ箱一覧取得」「復元」「完全削除」が実装済み。今回新規に必要なのは「ゴミ箱内1件の詳細取得」のみ。
  - 一覧: `GET /api/v1/my-ranking/trash`（`get-trash-list-my-ranking.controller.ts`、実装済み）
  - 復元: `PATCH /api/v1/my-ranking/trash/:rankingId/restore`（`restore-my-ranking.controller.ts`、実装済み）
  - 完全削除: `DELETE /api/v1/my-ranking/trash/:rankingId`（`permanent-delete-my-ranking.controller.ts`、実装済み）
  - 詳細取得（今回新規）: `GET /api/v1/my-ranking/trash/:rankingId`
- 既存の `GET /api/v1/my-ranking/:rankingId`（`get-my-ranking.controller.ts`）は `deleteFlg=false` 前提のため、削除済みランキングの詳細取得には使えない。既存 usecase には手を入れず、ゴミ箱専用の `GetTrashMyRankingUsecase`/`GetTrashMyRankingRepository` を新設する（trash系の他機能と同じく専用ユースケースとして分離する）。
  - 戻り値の型は既存の `MyRankingType` / `MyRankingOrderType`（`get-my-ranking.repository.interface.ts` に定義済み）をそのまま再利用する（形状が同一のため重複定義しない）
- ゴミ箱一覧の `TrashMyRankingListType` には現状 `itemCount` が無い。一覧カードで項目数を表示するため、`GetListMyRankingRepository` と同様に `count(rankingOrderMaster.id)` を追加する
- **論理削除時、`rankingMaster` だけでなく `rankingOrderMaster` 側も `deleteFlg: true` にカスケードされる**（`soft-delete-my-ranking.repository.ts` の `deleteRanking` で確認済み）。そのため「ゴミ箱内」を対象とする新規実装（詳細取得の項目一覧・一覧のitemCount集計）は、非ゴミ箱版（`deleteFlg=false`）とは逆に **`deleteFlg=true` で項目を絞り込む**必要がある（`restore-my-ranking.repository.ts` の `findRanking` が同条件で実装済み、参考にする）。この条件を誤ると項目が常に0件・itemCountが常に0になるバグになる（impl-planner レビューで指摘済み）
- ゴミ箱は「ホーム」「ランキング作成」と並ぶ独立したナビ項目として追加する（`my-ranking` には混在させず `features/trash/` を新設する）
- 一覧カードはクリックで詳細へ遷移するのみとし、復元・完全削除ボタンは詳細画面にのみ配置する（完全削除という不可逆操作を一覧上の誤クリックから守るため）
- 詳細画面は編集モードを持たない閲覧専用。「一覧に戻る」「復元する」「完全削除する」の3アクション。完全削除は確認ダイアログを挟む（既存の `my-ranking-detail-view.tsx` の削除確認ダイアログの実装パターンを踏襲）
- 復元は同名タイトルの生存ランキングが存在する場合 `DUPLICATE_TITLE` エラーになりうる（`restore-my-ranking.usecase.ts` で確認済み）。詳細画面でエラーメッセージ表示に対応する
- 一覧カードの日付表示は「削除日」とし、`rankingMaster.updatedAt` を転用する（`soft-delete-my-ranking.repository.ts` で論理削除時に `updatedAt` を更新している実装を確認済みのため、専用カラムの追加は不要）
- API呼び出しは `rpc-client.ts` の `rpc` を使用し、型アサーションは行わない

## バックエンド タスク

| # | タスク | ファイル | 前提 |
|---|--------|----------|------|
| 1 | ゴミ箱詳細取得 Repository interface 追加（`MyRankingType`/`MyRankingOrderType` を再利用） | `backend/src/domain/my-ranking/repository/get-trash-my-ranking.repository.interface.ts` | ― |
| 2 | domain バレル更新 | `backend/src/domain/my-ranking/repository/index.ts` | #1 |
| 3 | `GetTrashMyRankingRepository` 実装（ranking本体・項目とも `deleteFlg=true` で絞り込み。論理削除は `rankingMaster`/`rankingOrderMaster` 双方を `true` にカスケードするため、`findRankingOrder` 相当も `deleteFlg=true` で絞り込む。`restore-my-ranking.repository.ts` の `findRanking` と同じ条件） | `backend/src/infrastructure/my-ranking/repository/get-trash-my-ranking.repository.ts` | #1 |
| 4 | ゴミ箱一覧 Repository interface に `itemCount` 追加 | `backend/src/domain/my-ranking/repository/get-trash-list-my-ranking.repository.interface.ts` | ― |
| 5 | `GetTrashListMyRankingRepository` に `itemCount` 集計追加（leftJoin + count、**`deleteFlg=true` の項目のみカウント**。ゴミ箱内ランキングの項目は論理削除カスケードにより全て `deleteFlg=true` になっているため、非ゴミ箱版の `GetListMyRankingRepository`（`deleteFlg=false`）とは条件が反転する点に注意） | `backend/src/infrastructure/my-ranking/repository/get-trash-list-my-ranking.repository.ts` | #4 |
| 6 | infrastructure バレル更新 | `backend/src/infrastructure/my-ranking/repository/index.ts` | #3 |
| 7 | `GetTrashMyRankingUsecase` 実装 | `backend/src/application/my-ranking/usecase/get-trash-my-ranking.usecase.ts` | #3 |
| 8 | application usecase バレル更新 | `backend/src/application/my-ranking/usecase/index.ts` | #7 |
| 9 | `GetTrashMyRankingController` 実装（GET `MY_RANKING_TRASH_ID`） | `backend/src/presentation/my-ranking/controller/get-trash-my-ranking.controller.ts` | #7 |
| 10 | my-ranking ルーターへ追加 | `backend/src/presentation/my-ranking/controller/my-ranking.controller.ts` | #9 |
| 11 | presentation バレル更新 | `backend/src/presentation/my-ranking/controller/index.ts` | #9 |
| 12 | `npx tsc --noEmit` で型エラー確認 | ― | #1〜#11 |

## フロントエンド タスク

| # | タスク | ファイル | 前提 |
|---|--------|----------|------|
| 13 | paths.ts にパス定義追加（`trash`, `trashDetail`） | `frontend/src/config/paths.ts` | ― |
| 14 | query-key 定義 | `frontend/src/features/trash/api/query-key.ts` | ― |
| 15 | ゴミ箱一覧取得 hook | `frontend/src/features/trash/api/get-trash-list.ts` | バックエンド#10, #14 |
| 16 | ゴミ箱詳細取得 hook | `frontend/src/features/trash/api/get-trash-detail.ts` | バックエンド#10, #14 |
| 17 | 復元 mutation hook | `frontend/src/features/trash/api/restore-trash.ts` | バックエンド#10, #14 |
| 18 | 完全削除 mutation hook | `frontend/src/features/trash/api/permanent-delete-trash.ts` | バックエンド#10, #14 |
| 19 | 一覧用状態組み立て hook | `frontend/src/features/trash/hooks/use-trash-list.ts` | #15 |
| 20 | 詳細用状態組み立て hook（復元・完全削除・確認ダイアログ制御・エラーハンドリング） | `frontend/src/features/trash/hooks/use-trash-detail.ts` | #16, #17, #18 |
| 21 | `TrashCard` コンポーネント（Presentational。タイトル・itemCount・削除日） | `frontend/src/features/trash/components/trash-card.tsx` | ― |
| 22 | `Trash` 一覧コンポーネント（Presentational） | `frontend/src/features/trash/components/trash.tsx` | #21 |
| 23 | `TrashContainer`（hooks と接続、Suspense、カードクリックで詳細へ遷移） | `frontend/src/features/trash/components/trash-container.tsx` | #19, #22 |
| 24 | `TrashDetail` 表示コンポーネント（Presentational、閲覧専用、復元・完全削除ボタン＋確認ダイアログ） | `frontend/src/features/trash/components/trash-detail.tsx` | ― |
| 25 | `TrashDetailContainer`（hooks と接続、Suspense） | `frontend/src/features/trash/components/trash-detail-container.tsx` | #20, #24 |
| 26 | `router.tsx` へルート登録（`ProtectedRoute` > `DashboardContainer` 配下） | `frontend/src/app/components/router.tsx` | #13, #23, #25 |
| 27 | `dashboard-container.tsx` に navItems 追加（「ゴミ箱」） | `frontend/src/app/components/dashboard-container.tsx` | #13 |
| 28 | `npx tsc --noEmit` で型エラー確認 | ― | #13〜#27 |

---
合計: 28 タスク（バックエンド 12 / フロントエンド 16）
推奨着手順: #1 → #2 → #3, #4 → #5 → #6 → #7 → #8 → #9 → #10 → #11 → #12 → #13 → #14 → #15, #16, #17, #18 → #19, #20 → #21 → #22 → #24 → #23, #25 → #26, #27 → #28

---

## 追加機能: ゴミ箱一覧のページャー・フィルター

### 前提

- 一覧取得エンドポイント `GET /api/v1/my-ranking/trash`（実装済み）に、ページング（30件固定）とフィルター（タイトル・登録日・削除日）を追加する。詳細取得・復元・完全削除の各エンドポイントは対象外
- 参考実装: `C:\RPC\todo-react-hono-rpc\backend\src\api\todo`（`GetTodoListRepository` の `findAll`/`count` 分離、`LIMIT` static、`buildConditions` private抽出パターン）
- フィルター対象カラム: `rankingMaster.title`（`like` 部分一致）、`rankingMaster.createdAt`（登録日、`gte`/`lte`）、`rankingMaster.updatedAt`（削除日。論理削除時に更新される値を削除日時として転用する既存仕様をそのまま利用。専用カラム追加は不要）
- 既存の絞り込み条件（`deleteFlg=true`, `userId`一致）は維持したままAND条件として追加する
- レスポンス形状は `{ list, total, totalPages }`（`GetTodoListRepository` と同型）に変更する
- フロントの状態管理は既存の `frontend/src/hooks/use-transition-search-params.ts`（`useSearchParams` ラッパー、`frontend/src/features/login/hooks/use-login.ts` が使用例）でURLクエリパラメータに同期する。`frontend/src/hooks/use-query-params.ts` は初回マウント時のみ値を読む未使用の別ユーティリティのため今回は使わない
- フィルターUIは常時表示の折りたたみパネル方式とする（`todo-trash-search-bar.tsx` の構造を参考にするが、配色・角丸はRanking Makerのポップトーン `#0F9E93` 系に合わせて再設計する。テーブル表示は採用せず既存のカードグリッドを維持する）
- `frontend/src/components/ui/pagination/pagination.tsx` は現状どの画面からも未使用のため、配色（cyan→accent teal）を直接修正してよい（他画面への影響なし）
- `trash-card.tsx` / `trash.tsx` / `use-trash-list.ts` には本機能とは別件の未コミット変更（カード表示日付を「削除日」→「作成日」に変更）が既にある。これは維持し、その上に本機能の変更を積み重ねる
- RPCの型はバックエンドをsource of truthとし、フロントでAPI用の型を新規定義しない。`as` によるアサーションは行わない

### バックエンド タスク

| # | タスク | ファイル | 前提 |
|---|--------|----------|------|
| 29 | Repository interface を findAll/count 分離形に変更（クエリ型追加） | `backend/src/domain/my-ranking/repository/get-trash-list-my-ranking.repository.interface.ts` | ― |
| 30 | クエリスキーマ定義（Zod: title, createdAtFrom/To, updatedAtFrom/To, page） | `backend/src/presentation/my-ranking/schema/get-trash-list-my-ranking.schema.ts` | ― |
| 31 | Repository実装更新（`LIMIT=30` static、`buildConditions` private抽出、`findAll`+`count`実装） | `backend/src/infrastructure/my-ranking/repository/get-trash-list-my-ranking.repository.ts` | #29, #30 |
| 32 | Usecase更新（`{ list, total, totalPages }` を返す） | `backend/src/application/my-ranking/usecase/get-trash-list-my-ranking.usecase.ts` | #31 |
| 33 | Controller更新（`zValidator("query", ...)` 追加、totalPages計算） | `backend/src/presentation/my-ranking/controller/get-trash-list-my-ranking.controller.ts` | #30, #32 |
| 34 | `npx tsc --noEmit` で型エラー確認 | ― | #29〜#33 |

### フロントエンド タスク

| # | タスク | ファイル | 前提 |
|---|--------|----------|------|
| 35 | クエリキー定数定義（title/createdAtFrom/createdAtTo/updatedAtFrom/updatedAtTo/page） | `frontend/src/features/trash/constants/trash-query-params.ts` | ― |
| 36 | `Pagination` コンポーネント配色修正（cyan→accent teal、丸み調整） | `frontend/src/components/ui/pagination/pagination.tsx` | バックエンド#34 |
| 37 | 一覧取得API更新（クエリパラメータ対応 `$get({query})`、queryKeyにクエリ含める） | `frontend/src/features/trash/api/get-trash-list.ts`, `frontend/src/features/trash/api/query-key.ts` | バックエンド#34 |
| 38 | `TrashSearchBar` コンポーネント新規作成（タイトル検索＋詳細フィルター開閉＋登録日/削除日DatePicker range＋バッジ＋クリア/検索） | `frontend/src/features/trash/components/trash-search-bar.tsx` | #35 |
| 39 | 一覧用hook拡張（`useTransitionSearchParams`によるURL同期、検索条件state、ページstate、clickSearch/clearSearchCondition/changePageハンドラ） | `frontend/src/features/trash/hooks/use-trash-list.ts` | #35, #37 |
| 40 | `Trash` コンポーネント更新（検索バー常設、カードグリッド下にページャー表示） | `frontend/src/features/trash/components/trash.tsx` | #36, #38, #39 |
| 41 | `npx tsc --noEmit` で型エラー確認 | ― | #35〜#40 |

---
合計: 13 タスク（バックエンド 6 / フロントエンド 7）
推奨着手順: #29 → #30 → #31 → #32 → #33 → #34 → #35 → #36, #37 → #38, #39 → #40 → #41
