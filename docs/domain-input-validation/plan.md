# 入力値検証のドメイン移行

## 概要

外部入力の値の制約（文字数・形式・範囲など）を zod スキーマから値オブジェクト（VO）へ移し、制約違反を Result（err）で返す。zod スキーマは型・JSON 構造の検証のみにする。利用者向けのメッセージはプレゼンテーション層が決める。

方式は yomitsuzuri リポジトリ（同リポジトリの `docs/domain-input-validation/plan.md`）を踏襲する。本書では、踏襲する部分は要点のみ記載し、ranking-maker 独自の部分を詳しく記載する。

### 移行の理由（現状の問題）

zod と VO の両方に同じ制約を書いており（VO は違反時に throw）、両者が食い違っている。

- 空白だけのタイトル（`"   "`）は zod（`.min(1)`・trim なし）を通り、`RankingTitle`（trim 後に空判定）が throw して 500 になる
- `Order` の判定が `order < 1 && !Number.isInteger(order)` になっており（正しくは `||`）、0・負数・小数が通る。zod が先に弾いているため表に出ていない
- 生年月日の実在しない日付（例: `20230231`）は zod の正規表現を通り、`UserBirthday` が throw して 500 になる
- タグの重複・上限を zod（タグ名基準）と集約（タグID基準）の2か所で判定している
- 422 のトップの `message` が API ごとに異なる（「バリデーションエラー」「クエリが不正です。」「リクエストが不正です。」、パスパラメータは zod のエラー全文を 400 で返す）

## 決定事項

### ユーザー決定事項

- yomitsuzuri の方式に合わせる。置き場所の判断も yomitsuzuri を踏襲する
- 422 のトップの `message` は全 API で「入力エラー」にそろえる（zod 経由も含む）
- フロントエンドに影響を出さない（コード修正なし）。応答の形 `{ message, data: [{ field, message }] }`・422 を維持する
- 設計は全 API 分を先に詰める。実装はランキング作成で試行して設計を検証してから他へ広げる
- 既存データは、ユーザーの認識では新しい制約を満たしている（確認作業は未実施）
- D1: 文字列の列挙値（並び順 `sort`・テーマ `theme`）も、許容値の判定は VO の `create` で行う。zod は `z.string()` のみとする（zod は JSON の型だけを見て、許容値の判定はしない）
  - 経緯: Claude は当初「`z.enum` ならリクエストの RPC 型に許容値が伝わる」として zod に残す案を推奨したが、並び順はクエリのため RPC 型はもともと `string`（`backend/dist-types/presentation/my-ranking/controller/get-trash-list-my-ranking/get-trash-list-my-ranking.controller.d.ts`）で、根拠が誤っていた
  - 影響（D1）: テーマのリクエストの RPC 型が `"lavender" | "teal" | "peach" | "dark"` から `string` に広がる。フロントエンドは自前の `ThemeType` を渡しているため型エラーにはならない（コード修正なし）

- D2: 1回のリクエストで受け付ける件数の上限（一括削除・一括復元・CSV エクスポートの ID 件数 1〜100 件、一覧・ゴミ箱一覧の絞り込みタグ 20 個まで）は Usecase で判定する。上限の定数は各 Usecase の static 定数とする（前例: `GetListMyRankingUsecase.PAGE_SIZE`）
  - 理由: ID やタグ名の不変条件ではなく、1回の操作で受け付ける量の約束であるため（yomitsuzuri の確認用パスワードの一致（U6）と同じ扱い）
  - ID 一覧の要素の空文字は `RankingId.create`（`RANKING_ID_EMPTY`）で判定する（外部入力が原因のため err。zod の `.min(1)` を外すと `RankingId.of` が throw して 500 になるため）
  - 破綻ケース: 件数の上限が業務上の意味を持つようになった場合（例: 1フォルダに入れられるランキングの上限）は、ドメインに移す

- D3: `errorHandler` が Hono の `HTTPException` のメッセージ（英語の開発者向け。例: 壊れた JSON の "Malformed JSON in request body"）をそのまま返している件を本移行に含める（yomitsuzuri の追補と同じ対応）
  - ステータスは維持し、意味が確定しているステータスだけ文言を決める（400 →「入力エラー」）。それ以外は「予期しないエラーが発生しました。」。元のメッセージはログに残す
  - 壊れた JSON は項目単位の違反にできないため、422・`data` にはそろえず 400 のままにする
  - 破綻ケース: Hono の組み込みミドルウェア（`bodyLimit` の 413 等）を導入する場合は、対応するステータスの文言を追加する

### yomitsuzuri から踏襲する事項（yomitsuzuri でユーザーが決定済み）

- throw / err の基準
  - err: 原因が外部入力にあるもの（通常操作か、リクエスト改ざんかを問わない）
  - throw: 原因が自分たちのコードにあるもの（不具合・障害・自分たちの取得処理で除外済みのはずの状態）
- VO は private コンストラクタ + `create`（Result）。`of`（throw）は DB 等の信頼できる値から生成する必要がある場合にのみ置く
- エラーは VO ごとにドメインの言葉（コード）で型定義する。コード名は VO 名を接頭辞にし全体で一意にする。VO にメッセージを書かない
- Usecase は入力から VO を `create` で生成し、`Result.combineWithAllErrors` で違反をすべて集めて `{ type: "INVALID_INPUT"; errors: { field, error }[] }` を返す（この時点では DB を問い合わせない）。その後に DB を要する判定・集約の操作・保存を行う
- `field` は zod の `path.join(".")` と同じ形式（`items.2.itemName` など）
- メッセージ変換関数はコンテキストごとに1つ（`presentation/{コンテキスト}/error-message/{コンテキスト}.error-message.ts` の `toInputErrorMessage`。エラーの種類ではフォルダを分けない）。`satisfies never` で網羅性を保証する。集約の違反もこの関数で扱う
- zod の検証は `validatorMiddleware`（`middleware/validator/`）で行う。型・構造の違反は zod のメッセージを返さず、`field`（zod の path）と固定のメッセージ「入力形式が不正です」で 422 を返す。`formatZodErrors`・`ValidationErrorType` は削除する
- パスパラメータの ID は形式を判定しない。`RankingIdParamSchema` は `z.string()` のみとし、空の ID はルーティングで一致せず 404 になる
- 確認用パスワードの一致は Usecase で判定する（`PASSWORD_CONFIRMATION_MISMATCH`）
- ログインのユーザー名は `LoginName`（auth。「空でない」のみ）、照合用のパスワードは `RawPassword`（auth。「空でない」のみ）、新しく設定するパスワードは `NewPassword`（auth。8文字以上・半角英数記号）を新設する
- `UserName` に `create`（3〜30 文字）/ `of` を追加する。`UserLoginEntity.verifyPassword` は `RawPassword`、`hashNewPassword` は `NewPassword`、`IUserLoginRepository.getLoginUser` は `LoginName` を受け取る
- `RAW_PASSWORD_EMPTY` の文言はログイン・パスワード変更とも「パスワードを入力してください」にそろえる
- user・auth の Usecase は neverthrow の Result を返す。`CreateUserUsecase.execute` の引数はオブジェクトにする
- CLAUDE.md の「バックエンド固有の設計指針」に「入力値検証とエラーの扱い」を追記する（yomitsuzuri と同じ内容）

### Claudeの提案をユーザーが承認したもの

- ranking-maker の既存の応答（ステータス・文言）は、入力値検証に関係しないものは変えない（例: ログイン失敗は 400「IDかパスワードが間違っています。」のまま。yomitsuzuri の 401 には合わせない）
- 利用者向けの文言は、原則として現在の zod の文言を引き継ぐ。変わるものは「文言の対応表」に明記する
- 前後の空白の扱い（trim）は現在の VO の挙動を維持する（`RankingTitle`・`ItemName`・`TagName` は trim する。`RankingMemo`・`ItemMemo` は trim しない）。trim を足すと保存値が変わるため
- （撤回）未入力のメモの既定値（`""`）を zod の `.default("")` に残す案は撤回した。省略時の扱いは値の意味であり型・構造ではなく、yomitsuzuri も `default` を使っていない（`z.string().nullish()` + `BookMemo.create` で扱う）。下記ユーザー決定に置き換える
- メモ（ランキング・項目）は zod で必須の文字列（`z.string()`）とし、`default` を使わない（ユーザー決定。フロントエンドは未入力でも `""` を常に送っているため、保存値・画面の動きは変わらない。RPC のリクエスト型でメモが必須になるが、フロントエンドは修正なしで型チェックを通過することを確認）
  - 破綻ケース: メモを省略して送るクライアントが現れた場合は 422（入力形式が不正です）になる。必要になったら yomitsuzuri と同じく省略可とし、VO の `create` で省略時の扱いを決める
- 期間の絞り込み（`createdAtFrom` 等）・キーワードは現在も検証しておらず、本移行では制約を追加しない
- 一覧・ゴミ箱一覧のページ番号は、新設する `RankingListPagination`（my-ranking。yomitsuzuri の `BookListPagination` と同じ形）で判定する。一覧とゴミ箱一覧はページ番号の規則が同じため1つの VO を共有する（並び順は許容値が異なるため `RankingSort`・`TrashRankingSort` に分かれている）
- 空のページ番号（`page=`）は現在どおり省略と同じ扱い（1ページ目）にする
- ランキングの不変条件の違反（`RankingValidationError`）の `field` は現在どおり `items` / `tags` とする

### 未決定（ユーザー確認待ち）

なし

## 設計

### 層ごとの責務（yomitsuzuri と同じ）

| 層 | 責務 | 持たないもの |
|---|---|---|
| presentation（zod） | 型・JSON 構造の検証、エラーコード→メッセージ変換、レスポンス整形 | 業務ルール |
| application（Usecase） | VO 生成とエラーの収集・項目名（`field`）の付与、入力の約束（確認用パスワード等）、DB を要する判定、処理の流れ | 業務ルール、メッセージ |
| domain（VO・集約） | 業務ルールの判定、エラーのコード表現 | 画面の文言、項目名 |

### 値オブジェクト一覧

| VO | コンテキスト | エラー | `of` の要否 | 備考 |
|---|---|---|---|---|
| `RankingTitle` | my-ranking | `RANKING_TITLE_EMPTY` / `RANKING_TITLE_TOO_LONG`(max) | 要（Repository・`RestoreMyRankingUsecase`） | trim する |
| `PublicStatus` | my-ranking | `PUBLIC_STATUS_INVALID` | 要（Repository） | |
| `RankingIcon` | my-ranking | `RANKING_ICON_INVALID` | 要（Repository） | 実在確認は従来どおり `IconValidityDomainService` |
| `RankingMemo` | my-ranking | `RANKING_MEMO_TOO_LONG`(max) | 要（Repository） | trim しない |
| `ItemName` | my-ranking | `ITEM_NAME_TOO_LONG`(max) | 要（Repository） | trim する。空は null |
| `Order` | my-ranking | `ORDER_INVALID`(min) | 要（Repository） | 判定の不具合（`&&`）を直す。1以上の整数 |
| `ItemMemo` | my-ranking | `ITEM_MEMO_TOO_LONG`(max) | 要（Repository） | trim しない |
| `TagName` | my-ranking | `TAG_NAME_EMPTY` / `TAG_NAME_TOO_LONG`(max) / `TAG_NAME_INVALID_CHARACTER`(separator) | 要（`TagResolutionRepository`） | trim する |
| `RankingListPagination`（新設） | my-ranking | `RANKING_LIST_PAGE_INVALID`(min) | 不要 | 一覧・ゴミ箱一覧で共有 |
| `RankingId` | shared | `RANKING_ID_EMPTY` | 既存 | `create` を追加（D2） |
| `RankingSort` | my-ranking | `RANKING_SORT_INVALID` | 不要（DB の値から生成しない） | |
| `TrashRankingSort` | my-ranking | `TRASH_RANKING_SORT_INVALID` | 不要（DB の値から生成しない） | |
| `UserName` | shared | `USER_NAME_TOO_SHORT`(min) / `USER_NAME_TOO_LONG`(max) | 要（Repository） | yomitsuzuri と同じ |
| `UserBirthday` | user | `USER_BIRTHDAY_INVALID_FORMAT` / `USER_BIRTHDAY_NOT_EXIST` | 要（`UpdateUserRepository`。移行後のユーザー更新の見直しで追加） | yomitsuzuri と同じ |
| `UserTheme` | user | `USER_THEME_INVALID` | 既存（`UpdateUserRepository` が DB の値から生成） | `create` を追加 |
| `LoginName`（新設） | auth | `LOGIN_NAME_EMPTY` | 不要 | yomitsuzuri と同じ |
| `RawPassword`（新設） | auth | `RAW_PASSWORD_EMPTY` | 不要 | yomitsuzuri と同じ |
| `NewPassword`（新設） | auth | `NEW_PASSWORD_TOO_SHORT`(min) / `NEW_PASSWORD_INVALID_CHARACTER` | 不要 | yomitsuzuri と同じ |

### 集約

- `RankingAggregate` の不変条件の判定（項目名・順位・タグの重複、タグ数の上限）は変更しない
- zod の「タグ名の重複」「タグ数の上限」の判定は削除し、集約の `DUPLICATE_TAG`・`TOO_MANY_TAGS` に一本化する
  - 同じタグ名が複数指定された場合、`TagResolutionDomainService.resolve` が同じタグに解決するため、集約で `DUPLICATE_TAG` になる（確認済み）

### Usecase の判定順序（ランキング作成・更新）

1. 入力値の制約（VO の `create`）。違反があれば `INVALID_INPUT`（DB は問い合わせない）
2. （更新のみ）更新前のランキング取得（`NOT_FOUND`）
3. タイトル重複（`DUPLICATE_TITLE`）
4. アイコンの実在確認（`INVALID_ICON`）
5. タグ名の解決
6. 集約の生成・更新（`VALIDATION`）
7. 不適切内容の判定（`INAPPROPRIATE_CONTENT`。AI の呼び出しは最後に置く）
8. 保存

`field` の形式: `title`・`publicStatus`・`icon`・`memo`・`items.{index}.itemName`・`items.{index}.order`・`items.{index}.memo`・`tags.{index}`

### プレゼンテーション

- `presentation/my-ranking/error-message/my-ranking.error-message.ts`: my-ranking の全 VO エラーと `RankingValidationError` を受け取る `toInputErrorMessage`。作成・更新の Controller の `toValidationError` は、文言の変換をこの関数に統合し、`field`（`items`・`tags`）の付与は各 Controller に残す（yomitsuzuri と同じ）
- `presentation/user/error-message/user.error-message.ts`・`presentation/auth/error-message/auth.error-message.ts`: 変換の内容は yomitsuzuri と同じ（構成は Phase 7 で変更。yomitsuzuri は `error-message/input/`）
- `INVALID_INPUT` は `{ message: "入力エラー", data: [{ field, message }] }`（422）
- `middleware/validator/validator.middleware.ts`: yomitsuzuri と同じ

### 文言の対応表

「変更」欄が空のものは現在の zod の文言と同じ。

| エラー | 文言 | 変更 |
|---|---|---|
| `RANKING_TITLE_EMPTY` | タイトルは必須です | 空白だけのタイトルも対象になる（現在は 500） |
| `RANKING_TITLE_TOO_LONG` | タイトルは{max}文字以内で入力してください | |
| `PUBLIC_STATUS_INVALID` | 公開ステータスが不正です | |
| `RANKING_ICON_INVALID` | アイコンIDが不正です | |
| `RANKING_MEMO_TOO_LONG` | メモは{max}文字以内で入力してください | |
| `ITEM_NAME_TOO_LONG` | 項目名は{max}文字以内で入力してください | |
| `ORDER_INVALID` | 順位は{min}以上の整数で入力してください | 現在は「順位は整数で入力してください」「順位は1以上で入力してください」の2種類（yomitsuzuri の `CurrentPage` と同じく1種類にまとめる） |
| `ITEM_MEMO_TOO_LONG` | メモは{max}文字以内で入力してください | |
| `TAG_NAME_EMPTY` | タグは必須です | |
| `TAG_NAME_TOO_LONG` | タグは{max}文字以内で入力してください | |
| `TAG_NAME_INVALID_CHARACTER` | タグに「{separator}」は使えません | |
| `DUPLICATE_TAG`（集約） | 同じタグが複数指定されています | 現在の zod は「タグが重複しています: {タグ名}」 |
| `TOO_MANY_TAGS`（集約） | タグは{max}個までです | |
| `DUPLICATE_ITEM_NAME`・`DUPLICATE_ORDER`（集約） | 現在の Controller の文言のまま | |
| `RANKING_LIST_PAGE_INVALID` | ページ番号は{min}以上の整数で指定してください | 現在は zod の既定の英語メッセージ |
| `RANKING_SORT_INVALID`・`TRASH_RANKING_SORT_INVALID` | 並び順が不正です | 現在は zod の既定の英語メッセージ |
| `USER_THEME_INVALID` | テーマの値が不正です | |
| 一覧の絞り込みタグの件数超過（Usecase） | タグは{max}個までです | |
| ID 件数 0 件（Usecase） | ランキングを選択してください | |
| ID 件数超過（Usecase） | 選択できるランキングは{max}件までです | |
| `RANKING_ID_EMPTY` | ランキングIDが不正です | |
| `USER_NAME_TOO_SHORT` / `TOO_LONG` | ユーザー名は{min}文字以上で入力してください / ユーザー名は{max}文字以内で入力してください | |
| `USER_BIRTHDAY_INVALID_FORMAT` | 生年月日は日付形式(yyyyMMdd)で入力してください | |
| `USER_BIRTHDAY_NOT_EXIST` | 生年月日は実在する日付を入力してください | 新規（現在は 500） |
| `NEW_PASSWORD_TOO_SHORT` / `INVALID_CHARACTER` | パスワードは{min}文字以上で入力してください / パスワードは半角英数記号で入力してください | |
| `PASSWORD_CONFIRMATION_MISMATCH` | 確認用パスワードが一致しません。 | |
| `LOGIN_NAME_EMPTY` | ユーザー名を入力してください | |
| `RAW_PASSWORD_EMPTY` | パスワードを入力してください | パスワード変更の現在のパスワードは現在「現在のパスワードを入力してください」 |
| zod の型・構造の違反 | 入力形式が不正です | 現在は zod の各メッセージ |
| 422 のトップの `message` | 入力エラー | 現在は API ごとに異なる |

### フロントエンドへの影響

- コード修正はない
  - 422 の応答の形（`{ message, data: [{ field, message }] }`）は変わらない
  - リクエストの型（`InferRequestType`）は、テーマだけが `string` に広がる（D1）。他は変わらない。フロントエンドの呼び出しは型エラーにならない見込み。各 Phase で `npm run typecheck` を実行して確認する
- 画面に出る文言は「文言の対応表」の「変更」欄のものだけが変わる。いずれもフロントエンドの入力チェックを通らない入力でのみ発生する

### 破綻ケース

- 項目の組み合わせによるルール（開始日 ≤ 終了日など）が増えた場合: VO でも集約でもない判定の置き場所が必要になる
- 同じ入力変換を複数の入口から使う場合（インポート・AI 入力補助など）: Usecase の手順1をドメインの入力変換クラスに切り出す必要がある
- DB に、新しく VO に入れる制約を満たさない既存データがある場合: Repository の `of` が throw して 500 になる（特に `Order` の整数・1以上、`UserName` の 3〜30 文字）
- フロントエンドで入力欄ごとにエラーを表示する場合: `field` の形式を API の約束として固定し、フロントエンドと合わせる必要がある

## タスク

各 Phase の完了時に `npm run test`（backend）・ルートの `npm run typecheck`・`npm run lint` を実行する。コミットは Phase ごとに分ける（コミットはユーザーが行う）。

### Phase 1: ランキング作成 API（試行）

- [x] `validatorMiddleware` を新設する
- [x] `RankingTitle`・`PublicStatus`・`RankingIcon`・`RankingMemo`・`ItemName`・`Order`・`ItemMemo`・`TagName` に `create` / `of` / エラー型を追加し、コンストラクタを private にする（`new` の呼び出しはすべて `of` へ置換。更新 API・Repository・一覧 Controller・テストを含む）
- [x] `Order` の判定の不具合を直す
- [x] `CreateMyRankingUsecase` で `INVALID_INPUT` を返し、判定順序を「設計」のとおりにする
- [x] `presentation/my-ranking/error-message/input/` に `toInputErrorMessage` を置き、作成 Controller の `toValidationError` を統合する
- [x] `CreateMyRankingSchema` を型・構造のみにする
- [x] 作成 Controller を `validatorMiddleware` に切り替える
- [x] テスト（VO の `create` / `of`、Usecase の `INVALID_INPUT`、スキーマの型・構造）
- [x] 試行の結果を本書に反映する（設計の穴があれば修正してから Phase 2 へ進む）
- [x] ユーザーによる動作確認（空白だけのタイトルが入力エラーになること・通常の作成ができることを画面で確認）
- [x] コミット（ユーザーが実施）

試行の結果（2026-10-12）:

- 設計の穴は見つからなかった。入力値の違反は項目名付きですべて返り、DB は問い合わせない（テストで確認）
- 空白だけのタイトルは 500 ではなく `RANKING_TITLE_EMPTY` になる。同じタグ名の複数指定は集約の `DUPLICATE_TAG` になる（テストで確認）
- フロントエンドは修正なしで型チェックを通過した（`backend/dist-types` を再生成して確認）
- 置き換え時の注意: `new XXX(` を `XXX.of(` に一括置換すると、VO 自身の `create` 内の `new XXX(` まで置換され、`create` と `of` が互いを呼ぶ形になる。VO のファイルは置換対象から外す

### Phase 2: ランキング更新 API

- [x] `UpdateMyRankingUsecase` で `INVALID_INPUT` を返す（入力値の制約 → 更新前のランキング取得 の順）
- [x] 更新 Controller の `toValidationError` を `toInputErrorMessage` に統合する
- [x] 項目の入力値から VO を生成する処理（作成 Usecase の `createItemParam`）は、各 Usecase に持つ（ユーザー決定。作成・更新の入力の型や Controller の補助関数も Usecase・Controller ごとに定義している前例に合わせる。作成・更新以外の入口（インポート等）が増えた場合はドメインの入力変換への切り出しを検討する）
- [x] `UpdateMyRankingSchema` を型・構造のみにする
- [x] 更新 Controller を `validatorMiddleware` に切り替える
- [x] テスト
- [x] ユーザーによる動作確認（空白だけのタイトルが入力エラーになること・通常の更新ができることを画面で確認）
- [x] コミット（ユーザーが実施）

### Phase 3: 一覧系 API（マイランキング一覧・ゴミ箱一覧）

- [x] `RankingSort`・`TrashRankingSort` を private コンストラクタ + `create` にする
- [x] `RankingListPagination` を新設し、`MyRankingQueryType`・`TrashMyRankingQueryType` の `page` を置き換える
- [x] 絞り込みタグを `TagName.create` で判定し、件数上限（`RankingAggregate.MAX_TAG_COUNT`）を Usecase で判定する
- [x] `GetListMyRankingUsecase`・`GetTrashListMyRankingUsecase` を Result を返す形にし、文字列の入力を受け取って VO を生成する（現在は Controller が `new TagName`・`new RankingSort` している）
- [x] クエリスキーマを型・構造のみにする（`sort`・`page` の `default` は削除し省略可の文字列として受ける。空の `page=` は省略と同じ扱いにする）
- [x] 省略時の既定値（並び順は `RankingSort.DEFAULT`・`TrashRankingSort.DEFAULT`、ページは 1）は VO の `create` で決める（ユーザー決定。省略時の扱いは値の意味のため。フロントエンドは URL にない場合に実際に省略して送る）
- [x] `favoriteOnly` は zod の変換（`"true"` なら true、それ以外は false）を残し、VO は作らない（ユーザー決定。URL の文字列を真偽値に戻す型の変換であり、フロントエンドも `=== 'true'` で同じ解釈をしている（`use-my-ranking-list.ts`）。厳密にすると画面と API の結果が食い違う）
  - 破綻ケース: 「お気に入りを除く」など3つ目の状態が増えた場合は値の集合になるため VO に移す
- [x] Controller を `validatorMiddleware` に切り替え、`INVALID_INPUT` を返す
- [x] テスト
- [x] ユーザーによる動作確認（マイランキング一覧・ゴミ箱一覧で、絞り込み・並び替え・ページ移動が従来どおり動くことを画面で確認）
- [x] コミット（ユーザーが実施）

実装メモ（2026-10-13）:

- `page` の数値への変換と空文字（`page=`）の省略扱いは zod で行う（クエリの表記の問題のため）。省略時の既定値は `RankingListPagination.create` が決める
- `tags` は区切り文字での分割のみ zod で行い、前後の空白の除去と制約の判定は `TagName.create` で行う
- 絞り込みタグの件数上限は、各 Usecase の static 定数 `MAX_FILTER_TAG_COUNT`（値は `RankingAggregate.MAX_TAG_COUNT`）とする（D2）。違反のコードは集約の `TOO_MANY_TAGS` と概念が異なるため `TOO_MANY_FILTER_TAGS` とする

### Phase 4: ID 指定の API（一括削除・一括復元・CSV エクスポート・パスパラメータ）

- [x] ID 件数（1〜100 件）を Usecase で、空の ID を `RankingId.create` で判定し、`BulkSoftDeleteMyRankingUsecase`・`BulkRestoreMyRankingUsecase`・`GetMyRankingExportUsecase` を Result にして `INVALID_INPUT` を返す
- [x] `RankingIdParamSchema` を `z.string()` のみにする
- [x] パスパラメータ・お気に入り更新を含む全 Controller を `validatorMiddleware` に切り替える
- [x] テスト
- [x] ユーザーによる動作確認（一括削除・一括復元・CSV エクスポート・お気に入り切り替え・詳細表示が従来どおり動くことを画面で確認）
- [x] コミット（ユーザーが実施）

実装メモ（2026-10-13）:

- ID の件数の違反のコードは `EMPTY_RANKING_IDS`（0件）・`TOO_MANY_RANKING_IDS`（上限超過）とし、型は各 Usecase に直接書く（Phase 3 の `TOO_MANY_FILTER_TAGS` と同じ）。上限は各 Usecase の static 定数 `MAX_RANKING_ID_COUNT`（D2）。`field` は件数の違反が `ids`、ID ごとの違反が `ids.{添字}`
- パスパラメータの ID は、yomitsuzuri と同じく Controller から文字列のまま Usecase に渡し、Usecase の先頭で `RankingId.of` で生成する（ユーザー決定。空の ID はルーティングで一致せず届かないため `create` ではなく `of`）。対象はパスパラメータを受け取る8つの Usecase（取得・ゴミ箱取得・論理削除・完全削除・復元・更新・お気に入り更新・公開ランキング取得）で、引数は props オブジェクトにそろえた
- フロントエンドは一括操作の選択件数を制限していないため、100件を超えて選ぶと 422 になる（トーストの文言が「リクエストが不正です。」から「入力エラー」に変わる）

### Phase 5: user

- [x] `UserName` に `create` / `of`、`UserBirthday` に `create` を追加する
- [x] `NewPassword` を新設する
- [x] `CreateUserUsecase`・`UpdateUserUsecase` を Result にし、`INVALID_INPUT`（確認用パスワードの不一致を含む）を返す
- [x] `UserTheme` に `create` を追加し、`UpdateUserThemeUsecase` を Result にして `INVALID_INPUT` を返す
- [x] スキーマを型・構造のみにし、Controller を `validatorMiddleware` に切り替える
- [x] `presentation/user/error-message/input/` を置く
- [x] テスト
- [x] ユーザーによる動作確認（ユーザー登録・ユーザー情報の更新・テーマ切り替えが従来どおり動くこと、空白を含むなど制約外の入力が入力エラーになることを画面で確認）
- [x] コミット（ユーザーが実施）

実装メモ（2026-10-13）:

- `UserName`・`UserBirthday`・`NewPassword`、作成・更新の Usecase・スキーマ・Controller・エラーメッセージ変換は yomitsuzuri と同じ内容（ranking-maker 独自の差分はテーマのみ）。user の Usecase は yomitsuzuri と同じく props オブジェクトで `UserId` を受け取る
- `UserTheme` は ranking-maker 独自。`create`（`USER_THEME_INVALID`）を追加し、`of` は `create` を使って throw する形にした。`UpdateUserThemeUsecase` は Result を返し、更新できなかった場合は `NOT_FOUND`（応答は従来どおり 404「テーマを更新できませんでした。」）
- Phase 6 で `LoginName` に置き換えるまでの間、`LoginUsecase` は `UserName.create` が err なら DB を問い合わせずに認証失敗（従来どおり 400）とする（yomitsuzuri の Phase 4 と同じ。`of` だと制約外の名前で 500 になるため）
- Repository が DB の値から生成する `UserName` は `of` にした。結合テストのログイン名（`login-${ULID}` で 32 文字）が上限 30 文字を超えて 500 になったため、yomitsuzuri と同じく ULID そのもの（26 文字）に直した。ログインのテストは名前の長さで先に弾かれて意図と違う経路で通っていたため、同様に直した

### Phase 6: auth

- [x] `LoginName`・`RawPassword` を新設し、`UserLoginEntity`・`IUserLoginRepository` の引数を VO にする
- [x] `LoginUsecase`・`UpdatePasswordUsecase` を Result にし、`INVALID_INPUT` を返す（ログイン失敗・パスワード不一致の応答は現在のまま）
- [x] スキーマを型・構造のみにし、Controller を `validatorMiddleware` に切り替える
- [x] `presentation/auth/error-message/input/` を置く
- [x] テスト
- [x] ユーザーによる動作確認（ログイン・パスワード変更が従来どおり動くこと、短い新しいパスワードや確認用パスワードの不一致が入力エラーになることを画面で確認）
- [x] コミット（ユーザーが実施）

実装メモ（2026-10-14）:

- VO・エンティティ・リポジトリの引数・Usecase・スキーマ・エラーメッセージ変換は yomitsuzuri と同じ内容。Usecase のテストも yomitsuzuri から移した（`UserProfile` の形のみ ranking-maker に合わせた）
- 失敗時の応答は ranking-maker の現在のまま。ログイン失敗（`AUTHENTICATION_FAILED`）は 400「IDかパスワードが間違っています。」、パスワード更新の失敗（`CURRENT_PASSWORD_MISMATCH`・`NOT_FOUND`）は 400「パスワードの更新に失敗しました。」（yomitsuzuri はいずれも 401）
- `LoginUsecase` は Phase 5 で入れた `UserName.create` による仮の判定をやめ、`LoginName`（空でないことのみ）で DB を問い合わせる

### Phase 7: 仕上げ

- [x] `formatZodErrors`・`ValidationErrorType` を削除する。不適切内容の判定結果（`toInappropriateContentError`。`field` が画面向けの名前）は入力値の違反（`field` が入力の位置）と概念が異なるため、専用の型を定義する（Phase 1 の backend-review で検出）
- [x] `errorHandler` が `HTTPException` のメッセージを返さないようにする（D3。テストを含む）
- [x] CLAUDE.md に「入力値検証とエラーの扱い」を追記する
- [x] コミット（ユーザーが実施）

実装メモ（2026-10-14）:

- `errorHandler` とそのテスト、CLAUDE.md の追記は yomitsuzuri と同じ内容
- 不適切内容の判定結果の型（`InappropriateContentErrorType`）と変換関数（ranking-maker 独自。yomitsuzuri に該当機能なし）は、作成・更新の Controller に重複していたものを `presentation/my-ranking/error-message/my-ranking.error-message.ts` にまとめた
- `error-message/` は yomitsuzuri を踏襲して `input/` でエラーの種類ごとに分けていたが、「変換関数はコンテキストごとに1つ」の決定と合わず、入力値の違反でないエラー（不適切内容）の置き場所が定まらなかった。種類ではフォルダを分けず、コンテキストごとに1ファイル（`{コンテキスト}.error-message.ts`）に変更した（ユーザー決定）
- ランキングの不変条件の違反に `field`（`items`・`tags`）を付ける `toValidationError` は、yomitsuzuri（`INVALID_WORKS` の `field` を Controller で付ける）と同じく各 Controller に残した

### 対応しないと決めたこと

- 不適切内容の判定結果を、入力値の違反と同じ流れ（Usecase が入力の位置で `field` を付け、文言は `toInputErrorMessage` で作る）にそろえる案は、今は対応しない（ユーザー判断。害がないため）
  - 背景: `toInappropriateContentError` が返す `field`（「項目名（3件目）」等の表示名）は、フロントエンドでは React の `key` にしか使っておらず、画面に表示されていない

### 移行の途中で見つけて対応したこと（入力値検証の範囲外）

- パスワード変更: 現在のパスワードの照合と新しいパスワードの設定を `UserLoginEntity.changePassword` に移し、リポジトリはエンティティを受け取って保存する
- お気に入り切り替え: `RankingAggregate.changeFavorite` を通し、リポジトリは集約を復元・保存する
- エンティティ・集約の状態変更は、自身を書き換える形（新しいインスタンスを返さない）にそろえた（`RankingAggregate.update` を含む。ユーザー決定）
- ユーザー更新: `UserEntity.changeProfile` でユーザー名・生年月日を変更し、リポジトリは `UserEntity` を受け取って保存する。ユーザー名は `user_login_master.login_id` にも保存する（ログイン名はユーザー名を別の列にも保存したもので、ドメインでは独立した値として扱わない）
- フロントエンドのランキング作成・更新の違反の型（`ViolationType`）を、手書きから RPC の型の推論に変えた

## 実装時の注意（yomitsuzuri で判明済み）

- `Result.combineWithAllErrors([...] as const)` のように `as const` を付けると型が `never` になる。`as const` を付けずに配列リテラルを渡す
- `new XXX(` を `of` に置換する際は `grep -rn "new XXX("` で全呼び出し（Repository・DTO テスト・ドメインサービステスト含む）を洗い出す
- 作成用・更新用スキーマは流用ではなく複製のため、作成だけ先に移しても更新の検証は残る（yomitsuzuri のような一時的な書き写しは不要）
