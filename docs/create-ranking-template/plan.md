# ランキング作成画面 - テンプレートから作成機能

## 概要

ランキング作成画面に「テンプレートから作成」ボタンを追加する。ダイアログに既存の自分のランキングのタイトル一覧を表示し、選択すると即座にそのランキングの内容（タイトル・アイコン・メモ・項目）が作成フォームへ反映され、ダイアログが閉じる。

対象範囲：フロントエンドのみ（バックエンド変更なし）。

## 確定仕様

- 作成画面（`frontend/src/features/create-ranking`）に「テンプレートから作成」ボタンを追加し、ダイアログを開く
- ダイアログは既存の一覧取得API（`useMyRankings`）でタイトル一覧を表示する（ゴミ箱内は一覧APIの前提により自動的に除外される）
- 一覧は31件目以降が存在しうるため、一覧画面と同様のページャー（`Pagination`コンポーネント）をダイアログ内に設置する。ダイアログの縦横幅は一覧画面相当を想定する
- タイトル選択と同時に詳細取得API（`useMyRanking`のqueryOptionsを命令的に呼び出す形）を呼び、作成フォーム（`useCreateRankingForm`のreset()）へ title/icon/memo/items を反映してダイアログを閉じる
  - プレビュー表示はなし。選択と同時に即時反映してダイアログを閉じる（既存の `IconSelectDialog` と同じUXパターン）
- タイトルは選択元のランキングのものをそのままコピーする（同名になることを許容する）

## 設計方針

### データ取得コンポーネントの配置（Suspense境界）

- 一覧データ取得（`useMyRankings`, Suspense Query）とページstateは、`Dialog`のchildren配下・Suspense境界の内側に位置する末端コンポーネント（`template-ranking-list.tsx`）に閉じ込める。`Dialog`は`isOpen=false`時に`children`をレンダーしない（`return null`）ため、ダイアログが閉じている間はこの末端コンポーネントがマウントされずfetchも発生しない
  - `template-select-dialog.tsx`（`Dialog`のラッパー）は、この末端コンポーネントをSuspenseでラップして配置する責務のみを持つ
  - `use-template-select-dialog.ts` フックは一覧取得を持たない。開閉フラグと選択確定処理（詳細fetch→reset→クローズ）のみを持つ
  - ※一覧取得を`use-create-ranking.ts`や`useTemplateSelectDialog`のようなトップレベルで常時呼ばれるフックの中に置くと、作成画面表示時に即座にfetchが発火し画面全体がSuspenseでブロックされるため、この構成にはしない
- 詳細取得（選択確定時）はSuspense Queryである既存`useMyRanking`をイベントハンドラから直接呼べないため、`queryClient.fetchQuery`を使う命令的な取得関数を追加し、既存`useMyRanking`はそのqueryOptionsを共有する形にリファクタする

### ランキング読み取りAPIの配置（`app/api/` への移動）

途中のユーザー確認で、create-rankingからmy-rankingフォルダへの越境importを避ける方針が確定した（案A採用）。

- `frontend/src/features/my-ranking/api/get-my-ranking.ts`（詳細取得）と `get-my-rankings.ts`（一覧取得）を `frontend/src/app/api/` へ移動する
  - 前例：`frontend/src/app/api/get-icons.ts`に「ランキング作成・編集フォームで共有して使用する」という既存コメントがあり、同種の複数feature共有ケースに対して既に採用されている置き場所
- `myRankingKeys`（現状 `frontend/src/features/my-ranking/api/query-key.ts` の全内容）を `frontend/src/app/api/query-key.ts`（既存の`verifyKeys`・`iconKeys`と同居）に統合する。移動元の`features/my-ranking/api/query-key.ts`は削除する（re-exportによる後方互換シムは作らない）
- 上記の移動に伴い、`myRankingKeys`を参照している既存ファイルのimport元をすべて付け替える（新規追加ではなく既存コードの修正）：
  - `frontend/src/features/my-ranking/hooks/use-my-ranking-list.ts`
  - `frontend/src/features/my-ranking/hooks/use-my-ranking-detail-view.ts`
  - `frontend/src/features/my-ranking/hooks/use-my-ranking-detail-edit.ts`
  - `frontend/src/features/trash/hooks/use-trash-detail.ts`（既存の越境importを解消）
  - `frontend/src/features/create-ranking/hooks/use-create-ranking.ts`（既存の越境importを解消）
- `frontend/src/features/my-ranking/`側の書き込み系API（お気に入り・削除・CSV出力等）は移動しない。読み取り（一覧・詳細）のみを対象とする

### その他

- 一覧・詳細取得のキャッシュキーは統合後の `myRankingKeys`（`frontend/src/app/api/query-key.ts`）をそのまま再利用する（専用キーは新設しない）
- 新規ダイアログ関連コンポーネントは create-ranking 機能に閉じたものなので `frontend/src/features/create-ranking/components/` 配下にフラットに置く
- `form.reset()`に渡す値は`CreateRankingRequestType`に適合させる。`isPublic`は現状フォームUIから外され常に非公開送信のため`isPublic: false`固定とする
- RPC設計指針に従い、fetch直接使用・型アサーションは行わない。`InferResponseType`等で型推論する

## タスク一覧

- [x] #1 `get-my-ranking.ts`・`get-my-rankings.ts`を`frontend/src/app/api/`へ移動。`fetchQuery`ベースの命令的取得関数を追加し、既存`useMyRanking`をqueryOptions共有にリファクタ。`myRankingKeys`を`frontend/src/app/api/query-key.ts`に統合し、移動元の`features/my-ranking/api/query-key.ts`を削除
- [x] #2 #1の移動に伴うimport元付け替え（`my-ranking/hooks/use-my-ranking-list.ts`、`use-my-ranking-detail-view.ts`、`use-my-ranking-detail-edit.ts`、`trash/hooks/use-trash-detail.ts`）。`myRankingKeys.list`のパラメータをURLSearchParamsから明示的なオブジェクト型（`MyRankingListParamsType`）に変更し、URL文字列キー名（`MY_RANKING_QUERY_KEY`）への依存をmy-ranking機能側に閉じ込めた
- [x] #3 `TemplateRankingList` コンポーネント新規作成。Presentational純粋性維持のため、一覧取得・ページstateは`use-template-ranking-list.ts`（フック）と`template-ranking-list-container.tsx`（Container）に分離し、`template-ranking-list.tsx`はpropsのみで描画するPresentationalコンポーネントとした（`frontend/src/features/create-ranking/components/template-ranking-list.tsx`, `template-ranking-list-container.tsx`, `hooks/use-template-ranking-list.ts`）
- [x] #4 `TemplateSelectDialog` コンポーネント新規作成（`Dialog`のラッパー、#3のContainerをSuspenseでラップして配置。フォールバックUIは`Spinner`）（`frontend/src/features/create-ranking/components/template-select-dialog.tsx`）
- [x] #5 `useTemplateSelectDialog` hook新規作成（開閉フラグ・選択確定時の詳細fetch・フォームreset呼び出しのみ。一覧取得は持たない）（`frontend/src/features/create-ranking/hooks/use-template-select-dialog.ts`）
- [x] #6 `create-ranking.tsx` に「テンプレートから作成」ボタン・ダイアログ組み込み（`frontend/src/features/create-ranking/components/create-ranking.tsx`）
- [x] #7 `use-create-ranking.ts` に#5の状態・ハンドラを統合し、`create-ranking.tsx`へprops受け渡し（既存の`myRankingKeys`越境importは#2で解消済み）（`frontend/src/features/create-ranking/hooks/use-create-ranking.ts`）
- [x] #8 テスト追加（`template-ranking-list.test.tsx`: 選択・空状態・ページャー表示/操作の4件）

推奨着手順: #1 → #2 → #3 → #4 → #5 → #6 → #7 → #8

## 未確認の前提（Claudeからの提案）

- ダイアログ内Suspense境界のfallback UI・エラー時の表示方法は具体化していない。実装時に既存の`LoadingOverlay`等の共通コンポーネントから適切なものを選定する
