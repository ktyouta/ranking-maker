# 一覧ソート機能（my-ranking-sort）実装計画

## 対象

- マイランキング一覧（`/my-ranking`）とゴミ箱一覧（`/trash`）に並び替え機能を追加する
- 「お気に入り一覧画面」という独立画面は存在しない。お気に入りはマイランキング一覧の `favoriteOnly` フィルターであり、ソートは `favoriteOnly` の有無にかかわらず一覧全体に効く
- DB スキーマは変更しない（マイグレーション不要）

## 実装状況

バックエンド・フロントエンドとも実装済み。実装中に判明した、計画との差分は次のとおり。
- バックエンドの VO は、当初の「インターフェースファイル内の定数」から `value-object/` の VO クラスに変更した（設計判断2の経緯を参照）。名前は `RankingSort` / `TrashRankingSort`
- フロントの並び順の型（`MyRankingSortType` / `TrashSortType`）は、RPC からは導出せず、選択肢の定数（`as const`）から導出する形にした（設計判断4の経緯を参照）。選択肢・型・既定値（`DEFAULT_*`）は、`constants/*-sort-options.ts` に置いた
- API（`api/get-my-rankings.ts` / `api/get-trash-list.ts`）は、`sort` を他のパラメータと同じく `searchParams.get(...) || undefined` で読む。`sort` の props はない。クエリキーは `searchParams` から作られるため、`sort` もキーに含まれる
- URL の値から画面用の並び順への変換（選択肢にない値は既定）は、hook の中で直接書いた。関数や `types/` のファイルは作っていない。URL が改ざんされた場合、画面は既定を表示するが、API には改ざんされた値が渡り 422 になる（`page=abc` と同じ挙動）
- 並び替えのチップは、共通の `Button` で作った（文字サイズは `text-base`）
- モバイルの横一列表示は、既存の寸法のまま並び替えアイコンを追加した。実機幅での確認は未実施

## 確定した仕様（ユーザー確認済み）

- ソート項目とソート値
  - マイランキング：更新日・登録日・項目数の降順/昇順、お気に入り優先（昇順なし）の計7種
  - ゴミ箱：更新日・登録日・項目数の降順/昇順の計6種（お気に入りなし）。日付は「更新日」で表記する
- クエリパラメータは `sort=updatedAtDesc` のように、意味を持つ文字列キー1つで表す
- ドメインでの表現は、`value-object/` に VO クラスを置き、許容値の集合（`VALUES`）を単一権威とする（`PublicStatus` と同じ形）
- UI は検索バーに「並び替え」ボタンを追加し、パネルに選択肢を並べる。選んだ瞬間にソートする
  - モバイルでもボタンを横一列に並べる。並び替えボタンは絞り込みボタンと同じ大きさのアイコンにしてよい
  - チップの文言は「更新日 ↓」「更新日 ↑」の形式にする
- ソートは必ず指定カラムで行う
- 並び替えの UI はマイランキングとゴミ箱で共通化せず、別々に実装する
- 「クリア」ボタンの活性判定にソートを含める

## Claudeからの提案（ユーザーの明示的な承認はまだない前提）

- 未指定は `updatedAtDesc`（現状の動作）とし、「指定なし」の選択肢は作らない。既定値を選んだときは URL から `sort` を外す
- ソートは検索フォームの状態（`searchCondition`）に入れず、URL から読む。変更時は現在の `searchParams` を基準に `sort` だけ差し替え、`page` を削除する
- 「検索」押下時は現在のソートを保持する。「クリア」ではソートも既定に戻る
- 並び替えパネルと詳細フィルターパネルは、互いに独立して開閉する
- 第一キーは指定カラム。同値の行のページ境界を安定させるため、最終キーに `id` を付ける（項目数・お気に入りは、その前に `updatedAt` 降順を挟む）
- お気に入りのチップは向きが1つだけなので、矢印なしの「お気に入り」と表記する
- モバイルの並び替えボタンを追加しても、既存の `flex-wrap` と各ボタンの寸法は変えない。実機幅で確認し、はみ出す場合だけ調整する

## 設計判断

### 1. クエリの表現：文字列キー1つ

- 採用：`sort=updatedAtDesc`（案B）
- 不採用：数値ID（意味が読めず、フロントとバックエンドで対応表が二重になる）、キーと向きの2パラメータ（「お気に入りの昇順」のような無意味な組み合わせも表現できてしまう）
- 命名：パラメータ名は `sort`。値は既存クエリ（`createdAtFrom`、`favoriteOnly`）と同じ camelCase。`updatedAt:desc` のような区切り文字は `%3A` にエンコードされて読みにくいため使わない
- 業界標準の書式ではなく、このプロジェクト内の規則である

### 2. domain での表現：value-object に VO クラス

- 採用：`domain/my-ranking/value-object/` に `RankingSort`・`TrashRankingSort` を置く。`static readonly VALUES`（`as const` の配列）と `DEFAULT` を持ち、コンストラクタで許容値以外を弾く。型 `RankingSortType` は `VALUES` から導出する
- 名前は、同じフォルダの既存 VO（`RankingTitle`、`RankingMemo`、`RankingIcon`、`RankingOrderId`）の `Ranking~` プレフィックスに揃えた（当初は `MyRankingSort` としていたが、ユーザー判断で改名）
- スキーマは `z.enum(RankingSort.VALUES)` で許容値を参照する。コントローラーが `new RankingSort(sort)` でクエリ型（`sort: RankingSort`）に変換し、リポジトリは `sort.value` で `orderBy` を選ぶ
- マイランキングとゴミ箱でソートの VO を分ける。ゴミ箱にはお気に入りがなく、`updatedAt` の意味も異なるため（既存も `MyRankingQueryType` と `TrashMyRankingQueryType` が別）

#### 当初案からの変更経緯

- 当初は「インターフェースファイル内に定数と union 型を置く」案A を採用していた（VO クラスは「Zod と二重検証になる」ため不採用としていた）
- 実装後、ユーザーから置き場所の理由を問われて再確認したところ、次の点が判明したため、VO クラスに変更した
  - `domain/*/repository/*.ts` に実行時の値（`export const`）を置いた例は、それまで1つもなかった
  - 許容値の集合は `PublicStatus.VALUES` のように `value-object/` が単一権威になっていた（スキーマのコメントにも明記）
  - `PublicStatus` も、スキーマの `refine` と usecase の `new PublicStatus(...)` で二重に検証しており、「二重検証になる」は VO 不採用の理由にならなかった
  - 当初の「新規の domain ファイルがない」という利点は、ファイル数の少なさを優先した理由で、CLAUDE.md の設計方針に沿わない

### 3. スキーマ：`z.enum(...).default(...)`

- `z.enum(RankingSort.VALUES).default(RankingSort.DEFAULT)` を使う
- 不正値は既存どおり 422 を返す。参考実装のように不正値を黙って無視しない
- 当初は「`page` のような `z.preprocess` を避ければ、RPC の入力型が `unknown` にならず、フロントで選択肢の型を使える」と考えていた。これは誤りだった。同じクエリスキーマの `page` が `z.preprocess` のため、Hono の RPC クライアントは、クエリ全体の型を `string | string[]` に広げていた（確認用のファイルで、`keyword` を含む全キーが広がっていることを確認）。`sort` だけ避けても、効果はなかった

### 4. フロントの型

- 当初は `InferRequestType` で RPC から導出する計画だった。しかし、上記のとおり型が `string` に広がるため、導出しても保護にならない（`Extract<…, string>` の結果は `string` だった）
- そもそも、呼び出しに型は要らない（RPC のクエリは `string | string[]` を受け付ける）。不正な値は、バックエンドが 422 で弾く。CLAUDE.md の「API 用の型を新規定義しない」は、リクエスト・レスポンスの型の話で、画面の選択肢の値の一覧（ラベルとセットの UI 定数）とは別
- 採用：選択肢を `as const` で定義し、`(typeof OPTIONS)[number]['value']` で型を導出する。バックエンドにも `api/` にも依存しない。選択肢から探した結果は、`as` なしでリテラル型になる（確認済み：不正な値と、ゴミ箱の `favoriteDesc` は型エラーになる）
- 失うもの：バックエンドの並び順との食い違いを、コンパイル時に検出する保険。ただし、RPC の型が広がっている現状では、元から機能していなかった
- 案1（`page` のスキーマを直して RPC の型を復活させる）は、今回は行わない

## 参考実装（`todo-react-hono-rpc`）から踏襲しない点

- 数値IDでの指定、不正値を黙って無視する VO、infrastructure での VO 生成
- ソート変更時に入力途中の検索フォームの値まで確定してしまう動作
- ソートの第二キーがない点（ページ境界が不安定になる）
- 「指定なし」の選択肢

## この設計が破綻するケース

- 複数キーでのソート指定が必要になった場合、または汎用的なソート API が必要になった場合は、`sort=-field,field` 形式か、キーと向きの2パラメータに移行する必要がある
- 複数キーでのソートなど、1つの値では並び順を表せなくなった場合は、VO の構造自体を見直す必要がある
- ネイティブの選択肢ではなくチップ並びにしているため、選択肢が大きく増えた場合はパネルの構成を見直す必要がある

## 既知の挙動（変更しない）

- お気に入りトグル後の一覧は、楽観的更新のみで再取得しない。お気に入り順ソート中に★を外しても、その位置に残り、並びは次の再取得まで変わらない（「お気に入りのみ表示」ON のときの既存挙動と同じ）
- ゴミ箱の日付表示は「N日前」のみで、何の日付かのラベルはない。ゴミ箱の検索バーのフィルターラベルは「削除日」だが、ソートは「更新日」と表記する

## バックエンド タスク

| # | タスク | ファイル | 前提 |
|---|--------|----------|------|
| 1 | `RankingSort` VO を新規作成（`VALUES`・`DEFAULT`・`RankingSortType`）し、バレルに追加 | `backend/src/domain/my-ranking/value-object/ranking-sort/` | ― |
| 2 | `TrashRankingSort` VO を新規作成（お気に入りを除く6種）し、バレルに追加 | `backend/src/domain/my-ranking/value-object/trash-ranking-sort/` | ― |
| 3 | クエリ型に `sort`（VO）を追加 | `backend/src/domain/my-ranking/repository/get-list-my-ranking.repository.interface.ts`、`get-trash-list-my-ranking.repository.interface.ts` | #1, #2 |
| 4 | クエリスキーマに `sort` を追加 | `backend/src/presentation/my-ranking/schema/get-list-my-ranking.schema.ts`、`get-trash-list-my-ranking.schema.ts` | #1, #2 |
| 5 | コントローラーで `sort` を VO に変換 | `backend/src/presentation/my-ranking/controller/get-list-my-ranking.controller.ts`、`get-trash-list-my-ranking.controller.ts` | #3, #4 |
| 6 | `findAll` の `orderBy` を `buildOrderBy(sort)` に置き換え | `backend/src/infrastructure/my-ranking/repository/get-list-my-ranking.repository.ts`、`get-trash-list-my-ranking.repository.ts` | #3 |
| 7 | VO のテスト | `backend/test/domain/ranking-sort.test.ts`、`trash-ranking-sort.test.ts` | #1, #2 |
| 8 | リポジトリのテスト（全ソート値、タイブレーク） | `backend/test/infrastructure/my-ranking/repository/get-list-my-ranking.repository.test.ts`、`get-trash-list-my-ranking.repository.test.ts` | #6 |

## フロントエンド タスク（マイランキング・ゴミ箱それぞれ別実装）

| # | タスク | ファイル（マイランキング側。ゴミ箱は `features/trash/` に対応するファイル） | 前提 |
|---|--------|----------|------|
| 9 | クエリキー定数に `SORT` を追加 | `frontend/src/features/my-ranking/constants/my-ranking-query-params.ts` | ― |
| 10 | 一覧取得 API のクエリに `sort` を追加（`searchParams` から読む） | `frontend/src/features/my-ranking/api/get-my-rankings.ts` | バックエンド#4 |
| 12 | ラベル付き選択肢（`as const`）・そこから導出した型・既定値 | `frontend/src/features/my-ranking/constants/my-ranking-sort-options.ts`（新規） | ― |
| 14 | `useMyRankingList` に `sort` 読み取り（選択肢にない値は既定）・`changeSort`、`clickSearch` でのソート保持を追加 | `frontend/src/features/my-ranking/hooks/use-my-ranking-list.ts` | #9, #12 |
| 15 | `MyRanking` から検索バーへ `sort`・`onChangeSort` を受け渡し | `frontend/src/features/my-ranking/components/my-ranking.tsx` | #14 |
| 16 | 検索バーに並び替えボタン・パネル・印を追加。`isEmpty` にソートを含める | `frontend/src/features/my-ranking/components/my-ranking-search-bar.tsx` | #12 |
| 17 | ゴミ箱側の #9〜#16 | `frontend/src/features/trash/` 配下 | バックエンド#4 |

推奨着手順: #1, #2 → #3, #4 → #5, #6 → #7, #8 → （バックエンド確認）→ #9, #10 → #12 → #14 → #15, #16 → #17
