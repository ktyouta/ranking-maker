# ランキングへのアイコン（絵文字）追加 実装計画

## 前提・確定済み設計

- アイコンは固定候補（絵文字）からダイアログで選択する方式。ユーザーが自由な絵文字・画像をアップロードすることはさせない
- 候補の妥当性は `icon_master` テーブルが唯一の真実源（Pattern B）。ドメインコード側に候補の固定 `VALUES` 定数は持たない。候補の追加・廃止（論理削除）はDBのみで完結し、コードのデプロイを要さない
- `RankingIcon` 値オブジェクトは同期・構造チェックのみ（DBに依存しない）。マスタに存在するか／有効かの検証は、既存の「タイトル重複チェック」（`RankingTitleUniquenessDomainService`）と同型の `IconValidityDomainService` として usecase 層が呼び出す
- `icon_master` の削除は物理削除ではなく `deleteFlg` による論理削除（`rankingMaster` 等、既存テーブルと同じ命名・方式）。`ranking_master.icon` は `icon_master.id` への FK（`onDelete: "restrict"`）とし、既存ランキングが参照するアイコン行は削除できないようにする（`publicStatus` と同じ整合性保証）
- アイコン候補一覧はフロントにハードコードせず、新設APIをRPC経由（`InferResponseType`使用、型アサーション禁止）で取得する
- Icons取得APIの呼び出しは `create-ranking` と `my-ranking` の両機能で共有する（ユーザー確認済み）。ナビ項目に紐付かない共有APIのため、既存の `update-user-theme.ts` 等と同じ `frontend/src/app/api/` に配置する
- 作成・編集フォームは共有しない（既存方針を維持、`item-row.tsx` 同様に重複実装する）
- 作成フォームの初期値（デフォルトアイコン）は `🏆`（`icon_master.id = 1`）
- 作成・更新APIのリクエスト/レスポンスでは `icon_master.id`（整数）をそのままやり取りする（emoji文字列への変換は行わない、ユーザー確認済み）。`RankingIcon`値オブジェクトは整数idをラップし、構造チェック（正の整数か等）のみ行う。GetIconsのレスポンスは`{ id, emoji }[]`で、フロントはidを保持しつつemojiを表示に使う
- backendにVO・usecaseのテストが1件も存在しない現状を踏まえ、今回のアイコン機能でも新規にテストは書かない（ユーザー確認済み）

## 初期シード（22種）

- 装飾・順位系: 🏆（デフォルト・id=1） ⭐ ✨ 👑
- エンタメ系: 🍿 🎮 🎸 📚 📖 📕 📺 🎤
- 食べ物系: 🍜 🍕 🍣 🍰 ☕
- 趣味・生活系: ⚽ ✈️ 📷 🐶 🌸

## タスク一覧

### バックエンド（domain → infrastructure → application → presentation の順）

| # | タスク | ファイル | 前提 | 状態 |
|---|--------|----------|------|------|
| 1 | `iconMaster`テーブル定義を追加（`ranking_master`はまだ変更しない） | `backend/src/infrastructure/db/schema.ts` | ― | 完了 |
| 2 | カスタムマイグレーション作成（`db:generate --custom`）：`icon_master`のCREATE TABLE＋22絵文字INSERT（🏆は`id=1`を明示指定）。ローカルDBに適用して動作確認する | `backend/drizzle/0006_icon-master-seed.sql` | #1 | 完了 |
| 2a | `rankingMaster.icon`カラム（`.notNull().default(1).references(() => iconMaster.id, {onDelete:"restrict"})`）を追加 | `backend/src/infrastructure/db/schema.ts` | #2 | 完了 |
| 2b | 通常の`db:generate`（`--custom`なし）を実行し、drizzle-kitにテーブル再作成方式のマイグレーションを自動生成させる。生成SQLが既存カラム・既存FK・部分ユニークインデックスを漏れなく再現しているか確認してからローカルDBに適用する | `backend/drizzle/0007_kind_mindworm.sql` | #2a | 完了 |
| 3 | `RankingIcon`値オブジェクト定義（同期・構造チェックのみ、整数idをラップ） | `backend/src/domain/my-ranking/value-object/ranking-icon/ranking-icon.ts`（+`index.ts`） | ― | 完了 |
| 4 | マスタ存在確認用 Repository interface 定義 | `backend/src/domain/my-ranking/repository/icon-validity.repository.interface.ts` | #3 | 完了 |
| 5 | 選択肢一覧取得用 Repository interface 定義 | `backend/src/domain/my-ranking/repository/get-icons.repository.interface.ts` | #3 | 完了 |
| 6 | `IconValidityDomainService`定義（`RankingTitleUniquenessDomainService`と同型） | `backend/src/domain/my-ranking/service/icon-validity.domain-service.ts` | #4 | 完了 |
| 7 | `RankingAggregate`修正（`RankingIcon`フィールド追加、`toSnapshot()`反映） | `backend/src/domain/my-ranking/aggregate/ranking-aggregate/ranking-aggregate.ts` | #3 | 完了 |
| 8 | IconValidityRepository実装（Drizzle） | `backend/src/infrastructure/my-ranking/repository/icon-validity.repository.ts` | #2, #4 | 完了 |
| 9 | GetIconsRepository実装（`deleteFlg=false`のみ返す、`{id, emoji}`） | `backend/src/infrastructure/my-ranking/repository/get-icons.repository.ts` | #2, #5 | 完了 |
| 10 | CreateMyRankingRepository修正（`icon`列をinsert対象に追加） | `backend/src/infrastructure/my-ranking/repository/create-my-ranking.repository.ts` | #2b, #7 | 完了 |
| 11 | UpdateMyRankingRepository修正（`icon`列をupdate対象に追加） | `backend/src/infrastructure/my-ranking/repository/update-my-ranking.repository.ts` | #2b, #7 | 完了 |
| 12 | GetMyRankingRepository修正（`icon`（id）を含めて返す。JOIN不要、そのままの整数値） | `backend/src/infrastructure/my-ranking/repository/get-my-ranking.repository.ts` | #2b | 完了 |
| 13 | GetListMyRankingRepository修正（同上、一覧側） | `backend/src/infrastructure/my-ranking/repository/get-list-my-ranking.repository.ts` | #2b | 完了 |
| 14 | Create/Update Schema に`icon`フィールド追加（構造チェックのみ、整数） | `backend/src/presentation/my-ranking/schema/create-my-ranking.schema.ts` `update-my-ranking.schema.ts` | #3 | 完了 |
| 15 | Create/Update/Get系レスポンスDTOに`icon`（id）フィールド追加 | `backend/src/presentation/my-ranking/dto/` 配下の該当ファイル | #7, #12, #13 | 完了 |
| 16 | CreateMyRankingUsecase修正（`RankingIcon`構築＋`IconValidityDomainService`呼び出し、エラー型に`INVALID_ICON`追加） | `backend/src/application/my-ranking/usecase/create-my-ranking.usecase.ts` | #6, #7, #14 | 完了 |
| 17 | UpdateMyRankingUsecase修正（同上） | `backend/src/application/my-ranking/usecase/update-my-ranking.usecase.ts` | #6, #7, #14 | 完了 |
| 18 | GetIconsUsecase新設（副作用なし・単純参照） | `backend/src/application/my-ranking/usecase/get-icons.usecase.ts` | #9 | 完了 |
| 19 | CreateMyRankingController修正（`INVALID_ICON`のエラーマッピング追加） | `backend/src/presentation/my-ranking/controller/create-my-ranking.controller.ts` | #16 | 完了 |
| 20 | UpdateMyRankingController修正（同上） | `backend/src/presentation/my-ranking/controller/update-my-ranking.controller.ts` | #17 | 完了 |
| 21 | GetIconsController新設（`authMiddleware`必須） | `backend/src/presentation/my-ranking/controller/get-icons.controller.ts` | #18 | 完了 |
| 22 | ルート統合（動的パス`:rankingId`より前に登録） | `backend/src/presentation/my-ranking/controller/my-ranking.controller.ts` | #21 | 完了 |

### フロントエンド（hooks → Presentational → Container の順）

| # | タスク | ファイル | 前提 | 状態 |
|---|--------|----------|------|------|
| 23 | Icons取得API呼び出し関数＋query-key追加（RPC, `InferResponseType`使用、共有配置） | `frontend/src/app/api/get-icons.ts` `frontend/src/app/api/query-key.ts` | バックエンド#22 | 完了 |
| 24 | `IconSelectDialog`（Presentational、`{id, emoji}[]`をpropsで受け取る汎用ダイアログ、`ThemeSelectDialog`踏襲） | `frontend/src/components/layouts/icon-select-dialog/icon-select-dialog.tsx` | ― | 完了 |
| 25 | create-ranking フォームへのアイコン選択組み込み（初期値id=1、取得hook接続、送信データに`icon`(id)追加） | `use-create-ranking.form.ts` `use-create-ranking.ts` `create-ranking.tsx` `create-ranking-container.tsx` `types/create-ranking-request-type.ts` | #23, #24 | 完了 |
| 26 | my-ranking-detail-edit フォームへのアイコン選択組み込み（既存idの初期選択、送信データに`icon`(id)追加） | `use-update-my-ranking.form.ts` `use-my-ranking-detail-edit.ts` `my-ranking-detail-edit.tsx` `my-ranking-detail-edit-container.tsx` `types/update-my-ranking-request-type.ts` | #23, #24 | 完了 |
| 27 | `RankingCard`にアイコン表示追加（idからemojiを解決して表示） | `frontend/src/features/my-ranking/components/ranking-card.tsx` | バックエンド#22 | 完了 |
| 28 | `TrashCard`にも同様にアイコン表示追加（`RankingCard`の重複コンポーネントのため横展開。ゴミ箱一覧取得のバックエンド型に`icon`が不足していたため追加修正した） | `frontend/src/features/trash/components/trash-card.tsx` `trash.tsx` `use-trash-list.ts` `backend/.../get-trash-list-my-ranking.repository.{interface.ts,ts}` | #27 | 完了 |
| 29 | `my-ranking-detail-view`のアイコン表示を固定`IoTrophyOutline`からランキング固有の値に置き換え | `frontend/src/features/my-ranking/components/my-ranking-detail-view.tsx` | バックエンド#22 | 完了 |
| 30 | 既存テストへの影響確認 | 関連する`*.test.tsx` | #25〜#29 | 完了 |

---
合計: 32 タスク（バックエンド 24 / フロントエンド 8）
推奨着手順: #1 → #2 → #2a → #2b → #3 → #4, #5 → #6 → #7 → #8, #9, #10, #11, #12, #13 → #14 → #15 → #16, #17 → #18 → #19, #20 → #21 → #22 → #23 → #24 → #25, #26 → #27 → #28 → #29 → #30

## 設計上の補足（impl-planner確認・実装中に明確化した点）

- `publicStatus`は既存の運用ではコード側`VALUES`が権威（Pattern A）で、`icon`はテーブルが権威（Pattern B）という、既存マスタとは異なる新方式を導入する。意図した設計転換であり、"既存踏襲"ではなく"新パターンの導入"として実装者は認識すること
- `IconSelectDialog`は`ThemeSelectDialog`の「Dialogの使い方・選択中ハイライトの見た目」を踏襲するが、選択肢はハードコードせずpropsで受け取る点が異なる（DBが真実源のため必然の差分）
- `icon`のZodスキーマは構造チェックのみで、実在検証はUsecase層に委ねる非対称性がある（`publicStatus`は`VALUES`でスキーマ側も検証できる）。既存フィールドとの違いとして実装者は認識すること
- `icon_master`の初期データは`seed.sql`（`db:seed:local`専用、本番投入手段なし）ではなく、タスク#2のカスタムマイグレーションでINSERTする。これにより`db:migrate:prod`だけで本番にも反映される
- SQLiteは「REFERENCES列にNOT NULLのDEFAULTを同時指定するADD COLUMN」を許可しないことをスクラッチ環境で実証済み（`Cannot add a REFERENCES column with non-NULL default value`）。そのため`ranking_master.icon`の追加は単純なALTER TABLEではなく、既存の`0002_far_silver_samurai.sql`と同じ「テーブル再作成方式」が必要（タスク#2b）。この方式でのバックフィル・FK制約・restrictの動作、および自動生成されたスナップショットと手書きSQLの構造一致は、ローカルDB適用と`PRAGMA foreign_key_check`で実証済み
- `db:generate --custom`は現在のschema.tsの状態をスナップショットに反映しない（直前のスナップショットをそのまま引き継ぐだけ）。そのため`--custom`を使うのは純粋なデータ投入のみに限定し、テーブル定義の変更を伴う場合は必ず通常の`db:generate`で正しいスナップショットを生成させ、必要なら生成されたSQLファイルの中身だけを修正する（`_journal.json`やスナップショットは手動編集しない）
- 本番適用は`npm run db:migrate:prod`1コマンドで、`backend/drizzle/`配下の未適用マイグレーション（0006, 0007）を順番に適用する。追加の手動ステップは不要
- APIのリクエスト/レスポンスでは絵文字ではなく`icon_master.id`（整数）をやり取りする方針に確定（ユーザー確認済み）。DBのFK構造とAPI表現を一致させ、backend内部での emoji⇔id 変換ロジックを持たない
- backendにVO・usecaseのユニットテストが既存に1件も無いことが判明したため、今回のアイコン機能でも新規テストは書かない方針とした（ユーザー確認済み）

## 実施結果

- #1〜#30: 計画通り実装完了
- タスク#4（テスト）は「backendにVO・usecaseテストが1件も無い」ことが判明したため対象外にした（当初案は撤回、上記補足参照）
- タスク#28実施時に、ゴミ箱一覧取得（`get-trash-list-my-ranking`）のバックエンド型`TrashMyRankingListType`に`icon`フィールドが不足していることが判明し、追加で修正した（当初のバックエンドタスク分解での見落とし）
- `INVALID_ICON`エラーのレスポンス形状を、同一エンドポイントの他の422エラー（`VALIDATION`, `INAPPROPRIATE_CONTENT`）と揃え`data: [{field, message}]`形式にした。当初`message`のみの形状にしていたところ、同じ422ステータスに対する型のユニオンでフロント側`error.data`アクセスが型エラーになったため修正（結果的に既存の`violations`表示UIをそのまま流用できる形になった）
- `icon`のAPI表現は「絵文字そのもの」ではなく`icon_master.id`（整数）に確定（設計フェーズの終盤で再検討・ユーザー確認済み）
- `RankingIcon`VOは整数idをラップし、構造チェック（正の整数か）のみ行う。マスタ実在確認は`IconValidityDomainService`がusecase層から呼び出す
- `npx tsc --noEmit`：backend/frontendともにエラー0件（frontendの`login.stories.tsx`の1件は本機能と無関係の既存エラーであることを確認済み、対象外）
- 既存テスト：backend 35ファイル/134件、frontend 10ファイル/61件（`ranking-card.test.tsx`はicon prop追加に伴い修正）、全てパス
- `trash-detail.tsx`（ゴミ箱詳細画面）へのアイコン表示が当初のタスク分解・実装から漏れていた（`my-ranking-detail-view.tsx`と同様の画面だが対象外にしてしまっていた）。ユーザー指摘により`use-trash-detail.ts`/`trash-detail.tsx`に追加対応した
- **重大インシデント**：マイグレーション0007（`ranking_master`のテーブル再作成）で`DROP TABLE`実行時に`ranking_order_master.ranking_id`の`ON DELETE CASCADE`が発火し、ローカル開発DBの項目データが全て消失した。原因は参考にした`0002_far_silver_samurai.sql`の`PRAGMA foreign_keys=OFF/ON`によるカスケード防止を見落としたこと。検証時も親テーブル単体でしかテストしておらず、子テーブルを含む構成での検証不足があった。0007を修正し、子テーブルを含めた構成で再検証済み。本番（`db:migrate:prod`）は未実行だったため実害なし。ローカルDBの失われたデータはユーザーの指示により復元・リセットともに行わず、現状のまま維持している
- backend-review, db-naming-review, resource-authz-review, frontend-review, architecture-review, comments-review, rpc-review：いずれも問題なし（frontend-reviewで検出した2件の軽微な指摘—派生変数のコメント欠落、`useCallback`ラップ漏れ—は修正済み）
