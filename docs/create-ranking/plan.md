# ランキング作成画面（create-ranking）実装計画

## 前提

- バックエンドは実装済み・変更なし
  - `POST /api/v1/my-ranking`（`backend/src/presentation/my-ranking/controller/create-my-ranking.controller.ts`）
  - リクエスト: `title`, `publicStatus`(1=非公開/2=公開), `memo`, `items[]`(`itemName`, `order`, `memo`)
  - レスポンス:
    - 201: 作成されたランキング（`CreateMyRankingResponseType`）
    - 401: 認証エラー（`{ message }`）
    - 409: タイトル重複（`{ message }`）
    - 422: 入力エラー / 不適切内容検出（`{ message, data: { field, message }[] }`）
    - 500: サーバーエラー（`{ message }`）
- `paths.rankingCreate`（`/ranking-create`）は追加済み・未使用（`frontend/src/config/paths.ts`）
- `frontend/src/features/create-ranking/{api,components,hooks}` は空フォルダとして用意済み
- ドメインルール（`RankingAggregate.collectItemViolations`）: 項目名の重複・順位の重複は不可。順位は連番である必要はなく一意であればよい
  - → UI 側は項目の並び順（配列の index + 1）をそのまま `order` として送信し、ユーザーに順位番号を直接入力させない設計とする（重複を構造的に防止する）
- マイランキング更新画面とはリクエスト形状が酷似するが、フォーム（UI・コンポーネント）は共有しない（ユーザー確定済み方針）。ただし `PUBLIC_STATUS` のような単なる値の対応表（静的定数）はUIではなくバックエンドの `PublicStatus` VO の値をそのまま写したものであり、この「フォームを共有しない」方針の対象外とする。`frontend/src/features/my-ranking/constants/public-status.ts` を `frontend/src/constants/public-status.ts`（既存の `date-options.ts` 等と同階層）へ移動し、my-ranking・create-ranking の両方から参照する
- UI トーン: `docs/shared.md` のカラーパレット（`bg-accent` / `text-ink` / `text-ink-sub` / `bg-base` / `border-line`）に準拠する。画面ごとの詳細レイアウトは同ドキュメントで「未確定事項」のため、本画面用に新規に決める
- ドロワーナビゲーションの項目例に「作成」が含まれている（`docs/shared.md` ナビゲーション設計）が、現状ドロワーには「ホーム」しかない → 本タスクで「作成」リンクを追加する（マイランキング等、他の未リンク項目は対象外）
- ランキング項目の並び替えは `@dnd-kit/core` + `@dnd-kit/sortable`（新規依存）によるドラッグ＆ドロップと、上下移動ボタンを併用する（ユーザー確定済み方針）。ドラッグは直感的な操作用、ボタンは「気づきやすさ」「精密な移動」「ドラッグが苦手な場合の代替手段」を担う。両者とも操作対象は同じ配列順序（= 送信時の `order`）

## フロントエンド タスク

| # | タスク | ファイル | 前提 |
|---|--------|----------|------|
| 1 | 公開ステータス定数を共有場所へ移動（1=非公開/2=公開） | `frontend/src/constants/public-status.ts`（新規）／`frontend/src/features/my-ranking/constants/public-status.ts`（削除）／`frontend/src/features/my-ranking/components/my-ranking.tsx`（import元変更） | ― |
| 2 | フォームスキーマ（Zod）・型定義 | `frontend/src/features/create-ranking/types/create-ranking-request-type.ts` | ― |
| 3 | フォーム hook（`useForm` + `useFieldArray`） | `frontend/src/features/create-ranking/hooks/use-create-ranking.form.ts` | #2 |
| 4 | RPC 作成 mutation hook | `frontend/src/features/create-ranking/api/create-ranking.ts` | ― |
| 5 | 画面 hook（送信・項目追加/削除/並び替え（D&D + 上下ボタン共通のindex操作）・エラー処理・遷移） | `frontend/src/features/create-ranking/hooks/use-create-ranking.ts` | #1, #3, #4 |
| 5a | `@dnd-kit/core` `@dnd-kit/sortable` `@dnd-kit/utilities` を追加 | `frontend/package.json` | ― |
| 6 | `CreateRanking` Presentational コンポーネント（`DndContext`/`SortableContext`、各項目行にドラッグハンドル＋上下移動ボタン） | `frontend/src/features/create-ranking/components/create-ranking.tsx` | 5a |
| 7 | `CreateRankingContainer` | `frontend/src/features/create-ranking/components/create-ranking-container.tsx` | #5, #6 |
| 8 | ルート登録（`paths.rankingCreate` → `CreateRankingContainer`、`ProtectedRoute` 配下） | `frontend/src/app/components/router.tsx` | #7 |
| 9 | ドロワーに「作成」ナビリンクを追加 | `frontend/src/components/layouts/dashboard/dashboard.tsx` | #8 |

合計: 10 タスク（フロントエンドのみ）
推奨着手順: #1, #2, #5a → #3, #4 → #5 → #6 → #7 → #8 → #9

## 設計上の未確定点の解消（impl-planner レビューを受けて確定）

- **422/409エラーの表示**: 既存の signup/updateuser は `error.message` のみを `Error` にラップしており `data`（`{field, message}[]`）は扱っていない。今回は新規に、`api/create-ranking.ts` の `onError` を `(message: string, violations?: { field: string; message: string }[]) => void` に拡張し、`use-create-ranking.ts` 側で「`violations` があれば `message` の下に箇条書き、なければ `message` のみ」を表示する
- **作成成功後の遷移・キャッシュ更新**: `paths.myRanking.path` へ `navigate` する。`features/my-ranking/api/query-key.ts` の `myRankingKeys` を import し、成功時に `queryClient.invalidateQueries({ queryKey: myRankingKeys.lists() })` を実行して一覧を最新化する（cross-feature 参照だが、作成元機能が一覧のキャッシュキーを参照するのは自然な依存であり許容する）
- **`publicStatus`（1|2）・`order`（index+1）への変換**: フォームスキーマ（#2）は `isPublic: boolean` と `items: { itemName, memo }[]`（`order` を持たない）に留める。`PUBLIC_STATUS` 定数・配列インデックスからの変換は `use-create-ranking.ts` の送信処理内でのみ行う
- **`PUBLIC_STATUS` 定数**: 当初 create-ranking 側に複製する案だったが、これはUIではなく単なる値の対応表（バックエンドの `PublicStatus` VO の値をそのまま写したもの）であり「フォームを共有しない」方針の対象外と判断。`frontend/src/constants/public-status.ts` に一本化し my-ranking・create-ranking 双方から参照する
- **Storybook**: 直近の `my-ranking` 機能に合わせ、今回は `.stories.tsx` を作成しない

## 画面仕様メモ（未確定事項をこのタスクで確定させる範囲）

- 入力項目: タイトル（必須・100字以内）／公開設定（チェックボックス「公開する」・デフォルト非公開）／メモ（任意・1000字以内）／ランキング項目（1件以上、項目名必須・100字以内、メモ任意・1000字以内）
- ランキング項目の初期表示は空欄3行（一般的な「上位3件」を想定した初期値。ユーザーは追加・削除が可能で、1件未満には削除できない）
- 項目の並び替えは各行のドラッグハンドル（`@dnd-kit`）でのドラッグ＆ドロップと、上下移動ボタンの両方で行える。順位は入力させず、配列内の並び順をそのまま送信時に `order`（1始まり）へ変換する
- サーバーエラー（409重複タイトル／422入力エラー・不適切内容）は個別フィールドに紐付けず、フォーム上部に一覧表示する（`data` 配列がある場合は箇条書き、ない場合は `message` のみ）
  - 既存の signup/updateuser 画面と同じ「上部エラーバナー」パターンを踏襲する
- 配色は `docs/shared.md` のトークン（`bg-accent` / `text-ink` / `border-line` 等）に準拠し、既存の legacy な signup/updateuser 配色（gray/blue）は踏襲しない
