# ランキング詳細画面（ranking-detail）実装計画

## 前提

- 対象は「自分のランキング」を閲覧・編集する画面。バックエンドは `my-ranking` ドメインの既存APIを使う（`ranking` ドメインの `GET /api/v1/ranking/:rankingId` は公開ランキング閲覧用の別APIであり今回は使わない）
  - 取得: `GET /api/v1/my-ranking/:rankingId`（`get-my-ranking.controller.ts`、認証必須・userIdでスコープ）
    - レスポンス: `{ ranking: MyRankingType, rankingOrder: MyRankingOrderType[] }`
    - `MyRankingType`: `id, title, createdAt, updatedAt, publicStatus, publicStatusName`
    - `MyRankingOrderType`: `id, itemName, itemMemo, order, createdAt`（`order` は本計画のタスク#1,#2で追加。既存実装は `order` を返しておらず、並び順も保証されていなかった）
  - 更新: `PATCH /api/v1/my-ranking/:rankingId`（`update-my-ranking.controller.ts`、直前のバグ修正でルーティングが正常化済み）
    - リクエスト: `title`, `publicStatus`(1=非公開/2=公開), `memo`, `items[]`(`itemName`, `order`, `memo`)。**全置換方式**（既存itemの`id`は送らない。サーバー側で洗い替える）
    - レスポンス: 200（更新後の値）／401／404／409（タイトル重複）／422（入力エラー・不適切内容）／500
- 画面は「閲覧モード」と「編集モード」を持ち、切り替えは画面内部の state で行う（URL・ルーティングでは分けない）
  - `RankingDetailContainer` が `useState<'view' | 'edit'>('view')` でモードを保持し、Presentational（`RankingDetail`）に props として渡す（Presentationalコンポーネントの純粋性ルールを維持するため）
- カードから詳細画面への遷移は `ranking-card.tsx` の `<div>` に `onClick`（`useNavigate`）を追加する形で行う。`Link` は使わない（ユーザー確定済み方針）
- マイランキング更新画面（今回の編集モード）と作成画面（`create-ranking`）はリクエスト形状が酷似するが、フォーム（型・スキーマ・hooks・コンポーネント）は共有しない（`create-ranking` と同様の既定方針）。`PUBLIC_STATUS` 定数のみ `frontend/src/constants/public-status.ts` から共通参照する
- 項目の並び替えは `create-ranking` と同様に `@dnd-kit/core` + `@dnd-kit/sortable`（既存依存、追加インストール不要）によるドラッグ＆ドロップ＋上下移動ボタンを併用する
- 編集モードでは項目の追加・削除も可能とする（PATCHが全置換方式のため、作成画面と同じ操作性で問題ない）
- UIトーンは `docs/shared.md` のトークンに準拠する

## バックエンド タスク

| # | タスク | ファイル | 前提 |
|---|--------|----------|------|
| 1 | `MyRankingOrderType` に `order: number` を追加 | `backend/src/domain/my-ranking/repository/get-my-ranking.repository.interface.ts` | ― |
| 2 | `findRankingOrder` の SELECT に `order` を追加し `.orderBy(rankingOrderMaster.order)` で並び順を保証する | `backend/src/infrastructure/my-ranking/repository/get-my-ranking.repository.ts` | #1 |
| 3 | order の取得・ソート順を確認するテスト（`GetMyRankingRepository` を直接インスタンス化し、D1テストDBに項目を1件INSERTして `findRankingOrder` の返り値を検証するリポジトリレベルのテスト。認証込みの統合テスト基盤は今回新設しない） | `backend/src/infrastructure/my-ranking/repository/get-my-ranking.repository.test.ts`（新規） | #1, #2 |

## フロントエンド タスク

| # | タスク | ファイル | 前提 |
|---|--------|----------|------|
| 4 | 詳細画面パス追加（`/my-ranking/:rankingId`） | `frontend/src/config/paths.ts` | ― |
| 5 | 取得 hook・Query Key | `frontend/src/features/ranking-detail/api/get-ranking.ts` `frontend/src/features/ranking-detail/api/query-key.ts` | バックエンド#1,2 |
| 6 | 更新 mutation hook | `frontend/src/features/ranking-detail/api/update-ranking.ts` | バックエンド#1,2 |
| 7 | 編集フォームの型・Zodスキーマ（zod v4、`create-ranking` を参考に別実装） | `frontend/src/features/ranking-detail/types/update-ranking-request-type.ts` | ― |
| 8 | 閲覧用の表示整形 hook（Suspense対応、`order`昇順ソート・日付整形） | `frontend/src/features/ranking-detail/hooks/use-ranking-detail.ts` | #5 |
| 9 | 編集フォーム hook（`useForm` + `useFieldArray`） | `frontend/src/features/ranking-detail/hooks/use-update-ranking.form.ts` | #7 |
| 10 | 更新実行 hook（送信・成功時に閲覧モードへ戻す・エラー処理・キャッシュ更新） | `frontend/src/features/ranking-detail/hooks/use-update-ranking.ts` | #6 |
| 11 | 編集モードの項目行コンポーネント（`create-ranking/item-row.tsx` を参考に別実装、D&D＋上下ボタン） | `frontend/src/features/ranking-detail/components/item-row.tsx` | ― |
| 12 | 閲覧モード表示コンポーネント（Presentational） | `frontend/src/features/ranking-detail/components/ranking-detail-view.tsx` | ― |
| 13 | 編集モードフォームコンポーネント（Presentational） | `frontend/src/features/ranking-detail/components/ranking-detail-edit.tsx` | #11 |
| 14 | `RankingDetail`（Presentational。`mode` propで#12/#13を出し分け） | `frontend/src/features/ranking-detail/components/ranking-detail.tsx` | #12, #13 |
| 15 | `RankingDetailContainer`（`mode` state・hooks接続） | `frontend/src/features/ranking-detail/components/ranking-detail-container.tsx` | #8, #9, #10, #14 |
| 16 | `router.tsx` へのルート登録（`ProtectedRoute` 配下） | `frontend/src/app/components/router.tsx` | #4, #15 |
| 17 | `RankingCard` に `id`・`onSelect: (id: string) => void` props を追加し `div onClick={() => onSelect(id)}` にする | `frontend/src/features/my-ranking/components/ranking-card.tsx` | #4 |
| 17a | `MyRanking` に `onSelectRanking` props を追加し、各カードへ `id`・`onSelect` を渡す | `frontend/src/features/my-ranking/components/my-ranking.tsx` | #17 |
| 17b | `MyRankingContainer` に `useNavigate` + `useCallback` で `handleSelectRanking` を実装し `onSelectRanking` として渡す | `frontend/src/features/my-ranking/components/my-ranking-container.tsx` | #4, #17a |
| 18 | カードクリックで `onSelect` が呼ばれることを確認するテスト | `frontend/src/features/my-ranking/components/ranking-card.test.tsx`（新規） | #17 |

合計: 20 タスク（バックエンド 3 / フロントエンド 17）
推奨着手順: #1 → #2 → #3 → #4 → #5, #6, #7 → #8, #9, #10 → #11 → #12, #13 → #14 → #15 → #16 → #17 → #17a → #17b → #18

## Presentational/Container 方針の修正（impl-plannerレビューを受けて確定）

- `RankingCard`（Presentational）に `useNavigate` を直書きしない。`id` と `onSelect: (id: string) => void` を props で受け取り、内部で `onClick={() => onSelect(id)}` するだけにとどめる
- 実際の画面遷移（`useNavigate`）は `MyRankingContainer` に置き、`useCallback` でラップした `handleSelectRanking` を `MyRanking` → `RankingCard` の順に props で渡す
- `paths.ts` の詳細画面パスには他の動的パス同様 `getHref(rankingId: string)` を用意し、`handleSelectRanking` はそれを使って `navigate(paths.rankingDetail.getHref(id))` する

## 設計上の未確定点の解消

- **編集モードでの公開設定**: `create-ranking` と同じく「公開する」チェックボックス（`isPublic: boolean`）を使い、送信時に `PUBLIC_STATUS` 定数で `publicStatus`(1|2) に変換する
- **項目のキー管理**: `PATCH` は全置換方式で `items[].id` を送らないため、編集フォーム内の行キーは `useFieldArray` が発行する `field.id` を使う（取得時の `MyRankingOrderType.id` はDOM上のkeyや初期値の紐付けにのみ使い、送信ペイロードには含めない）
- **保存成功後の挙動**: 一覧画面への遷移はしない。`mode` を `'edit'` → `'view'` に戻し、`ranking-detail` 自身のクエリキーと `my-ranking` 一覧のクエリキー（`myRankingKeys.lists()`）の両方を invalidate する（タイトル・項目数・公開状態が一覧表示に影響するため）
- **編集キャンセル**: フォームを `reset()` し、`mode` を `'view'` に戻す（送信しない）
- **422/409エラー表示**: `create-ranking` と同じ「フォーム上部エラーバナー」パターンを踏襲する

## 画面仕様メモ

- 閲覧モード: タイトル・公開状態（バッジ表示。詳細画面が公開/非公開を確認・変更する唯一の場所になる）・メモ・項目一覧（`order`昇順、順位番号・項目名・項目メモ）・作成日
- 編集モード: タイトル（必須・100字以内）・公開設定（チェックボックス）・メモ（任意・1000字以内）・項目一覧（追加・削除・並び替え可、項目名必須・100字以内、メモ任意・1000字以内、項目名重複不可）
- 画面上部に「編集」ボタン（閲覧モード時）／「保存」「キャンセル」ボタン（編集モード時）
