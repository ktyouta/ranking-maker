# ランキング一括CSV出力機能 実装計画

## 設計変更履歴

- 初版ではCSV文字列への変換をフロントエンドで行う設計だったが、バックエンド実装（タスク#1〜#13相当）・backend-review完了後、ユーザーより「バックエンドでCSVを作成するつもりだった」との指摘を受け設計変更。
- design-proposalスキルで「①現状維持（フロントでCSV生成）」「②バックエンドでCSV生成しtext/csvとして返却」「③バックエンドでCSV生成しJSONに文字列として包んで返却」の3案を比較。Claudeは③を推奨したが、ユーザーから「一般的にはどちらが標準か」との確認があり、CSVエクスポートエンドポイントの一般的な実装（Content-Type: text/csv + Content-Disposition）としては②が標準的である旨を回答。ユーザーは②で進めることを承認。
- 以降の本ドキュメントは②（バックエンドでCSV生成・text/csvレスポンス）を前提に更新済み。

## 前提

- 一覧API（`GET /api/v1/my-ranking`）は`itemCount`のみを返し、ランキング項目（items）本体は返さない。そのため選択されたランキングの項目取得には新規エンドポイントが必要。
- 新規エンドポイント: `POST /api/v1/my-ranking/export`（body: `{ ids: string[] }`）。
  - 副作用のない取得処理だが、選択idsはページ遷移をまたいで蓄積され件数が実質無制限になりうるため、GETのクエリ文字列ではなくPOSTボディで送る。
  - サーバー側は受け取ったidsを`userId`条件でフィルタし、他人のランキングidが紛れても除外する（クライアントを信頼しない）。
  - DBアクセスは常に2クエリ（ランキング本体を`inArray`で1回、項目を`inArray`で1回）。既存の`GetListMyRankingRepository`と同じ発想。
- 選択状態（`selectedIds`）はページ単位のデータとは独立したstateで管理し、ページ送りしても保持する。ただし「全選択」ボタンは常に**現在ページの行のみ**を選択対象にする（検索条件に一致する全件を1クリックで選択する機能は今回のスコープ外、下記「将来検討事項」参照）。
- 一括削除は今回のスコープ外。同じ選択モード基盤（`use-my-ranking-selection.ts`）に将来アクションとして追加する想定。
- CSVはitem単位で1行に展開する（列: `ランキングタイトル, 順位, 項目名, メモ`）。UTF-8 BOM付きでExcelでの文字化けを防止。ファイル名は`ranking_export_YYYYMMDD_HHmmss.csv`。
- **CSV文字列の組み立てはバックエンドで行う**（`backend/src/util/build-csv.util.ts`の汎用エスケープ関数＋`backend/src/presentation/my-ranking/dto/get-my-ranking-export-csv.dto.ts`のドメイン別マッピング）。Controllerは`c.text(csv, 200, { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=..." })`でCSVをそのままレスポンスとして返す。新規外部ライブラリ（papaparse等）は導入せず、エスケープ処理（カンマ・ダブルクォート・改行を含む場合は`""`で囲む、RFC4180準拠）は自前実装する。
- フロントエンドは受け取ったCSVテキストをそのままダウンロードさせるだけで、CSV文字列の組み立ては行わない（旧タスクの`build-ranking-csv.ts`は不要）。新規外部ライブラリ（file-saver等）は導入せず、Blob生成＋aタグdownloadで完結させる。
- RPCの型はバックエンドをsource of truthとし、フロントでAPI用の型を新規定義しない。`as`によるアサーションは行わない。
- ルート登録順序: `my-ranking.controller.ts`は「静的パスを`:rankingId`より先に登録する」慣習があるため、`getMyRankingExport`は`getMyRanking`より前に`.route("/", ...)`する。
- VO変換の責務: 既存パターン（`get-my-ranking.controller.ts`）に合わせ、Controllerでリクエストボディの`ids: string[]`を`RankingId.of(id)`の配列に変換してからUsecaseへ渡す。Usecaseは`RankingId[]`を受け取る。
- **【セキュリティ上必須】2クエリの実行順序**: Usecaseは必ず ①`findRankings(userId, rankingIds)`で所有権フィルタ済みのランキング一覧を取得 → ②その結果に含まれる`rankingId`のみを`findRankingOrders`に渡す、という順序を守る。クライアントから渡された生の`rankingIds`をそのまま`findRankingOrders`に渡さない（他人のランキング項目が混入する事故を防ぐため）。
- 空配列時のレスポンス方針: リクエストされた全idが所有権外・削除済みで除外され結果が空になった場合、Controllerは`c.text()`ではなく`c.json({ message: "エクスポート対象のランキングが見つかりませんでした。" }, 200)`を返す（一覧取得エンドポイントが0件時も200を返す既存方針と統一。ただし本エンドポイントは通常時`text/csv`を返すため、0件時のみ`Content-Type`が`application/json`になる）。フロントの`export-my-ranking-csv.ts`はレスポンスの`Content-Type`ヘッダーを見て、`application/json`の場合はJSONをパースしてメッセージをtoast表示（ダウンロードは行わない）、それ以外（`text/csv`）の場合は`.text()`でCSV文字列を取得してダウンロードに渡す、という分岐を行う。
- item側の返却型: 既存`MyRankingOrderType`は単一ランキング前提で`rankingId`を持たないため、新規に`rankingId`を含む型（`MyRankingExportOrderType`）を`get-my-ranking-export.repository.interface.ts`に定義する。
- 上限件数バリデーション: リクエストできる`ids`は最大100件とする（SQLite/D1のクエリバインド変数上限に対する十分な余裕を持たせつつ、一覧のページサイズ30件の3ページ分超をカバーする現実的な値）。超過時は`UNPROCESSABLE_ENTITY`（既存の`get-list-my-ranking.controller.ts`のクエリバリデーションエラーと同じ方針）を返す。
- `RankingCard`の選択モード表示: 選択モード中はカード左上（アイコン領域に重ねる形）にチェックボックスを表示し、カード全体のクリックは選択トグルに切り替える。右上のお気に入りボタン（★）は非選択モード時と同じ位置・機能のまま残し、選択モード中も操作可能とする（`stopPropagation`は維持し、要素を削らない）。
- `ranking-card.test.tsx`に選択モード関連のテストケース（チェックボックス表示、クリックで選択トグルされること）を追加する。
- CSV出力の非同期処理は既存の`useToggleMyRankingFavoriteMutation`と同様、`@tanstack/react-query`の`useMutation`を使う（キャッシュ操作は行わないため`query-key`の新規追加は不要）。

## 将来検討事項（今回のスコープ外）

- **検索条件に一致する全件を1クリックで選択・エクスポートする機能**（本来の要望）。`GetListMyRankingRepository.buildConditions`を流用し、id一覧のみをページングなしで返す新規エンドポイントが必要になる。該当件数が多い場合、DBクエリのパラメータ上限・CSVサイズ・Cloudflare Workersの実行時間制限への対処が追加で必要。今回はMVPとして見送り、ページ単位の全選択で運用する。
- **一括削除**。選択モード基盤（`use-my-ranking-selection.ts`）に削除アクションを追加する形で対応する想定。

## バックエンド タスク

| # | タスク | ファイル | 前提 | 状態 |
|---|--------|----------|------|------|
| 1 | `API_ENDPOINT.MY_RANKING_EXPORT` 追加（`/api/v1/my-ranking/export`） | `backend/src/constant/api-endpoint.const.ts` | ― | [x] |
| 2 | リクエストボディZodスキーマ（`ids: string[]`、空配列不可、最大100件） | `backend/src/presentation/my-ranking/schema/get-my-ranking-export.schema.ts` | ― | [x] |
| 3 | schemaバレル更新 | `backend/src/presentation/my-ranking/schema/index.ts` | #2 | [x] |
| 4 | Repository interface定義（`MyRankingExportType`, `MyRankingExportOrderType`（`rankingId`付き）, `IGetMyRankingExportRepository`） | `backend/src/domain/my-ranking/repository/get-my-ranking-export.repository.interface.ts` | ― | [x] |
| 5 | domainバレル更新 | `backend/src/domain/my-ranking/repository/index.ts` | #4 | [x] |
| 6 | Repository実装（`findRankings`: `inArray`+`userId`一致、`findRankingOrders`: `inArray`。2クエリで完結） | `backend/src/infrastructure/my-ranking/repository/get-my-ranking-export.repository.ts` | #4 | [x] |
| 7 | infrastructureバレル更新 | `backend/src/infrastructure/my-ranking/repository/index.ts` | #6 | [x] |
| 8 | Usecase実装（①`findRankings`で所有権フィルタ済み一覧を取得→②そのidのみを`findRankingOrders`に渡す、の順序を厳守。結果を`rankingId`でグルーピングし`{ranking, items}[]`に整形。0件でもエラーにせず空配列を返す。戻り値の型`MyRankingExportResultType`をexportし、presentation層のDTOから参照できるようにする） | `backend/src/application/my-ranking/usecase/get-my-ranking-export.usecase.ts` | #6 | [x] |
| 9 | applicationバレル更新 | `backend/src/application/my-ranking/usecase/index.ts` | #8 | [x] |
| 10 | CSVエスケープ汎用ユーティリティ（`buildCsv(headers, rows)`。カンマ・ダブルクォート・改行を含む値は`""`で囲む＝RFC4180準拠、BOM付与） | `backend/src/util/build-csv.util.ts` | ― | [x] |
| 11 | ファイル名タイムスタンプ生成ユーティリティ（`formatExportFilenameTimestamp(date)`、`YYYYMMDD_HHmmss`形式） | `backend/src/util/format-export-filename-timestamp.util.ts` | ― | [x] |
| 12 | utilバレル更新 | `backend/src/util/index.ts` | #10, #11 | [x] |
| 13 | レスポンスDTO実装（Usecase結果`MyRankingExportResultType[]`を`[ランキングタイトル, 順位, 項目名, メモ]`の行に展開し#10でCSV文字列化。既存`CreateMyRankingResponseDto`の命名規則(`[操作名]-response.dto.ts`)に合わせ`GetMyRankingExportResponseDto`とし、`.value`で公開） | `backend/src/presentation/my-ranking/dto/get-my-ranking-export-response.dto.ts` | #8, #10 | [x] |
| 14 | dtoバレル更新 | `backend/src/presentation/my-ranking/dto/index.ts` | #13 | [x] |
| 15 | Controller実装（POST, authMiddleware, `zValidator("json", ...)`、bodyの`ids`を`RankingId.of(id)`配列に変換してからUsecaseへ渡す。結果0件時は`c.json({message},200)`、1件以上時は#13でCSV文字列化し`c.text(csv,200,{Content-Type:"text/csv; charset=utf-8", Content-Disposition:"attachment; filename=..."})`で返す） | `backend/src/presentation/my-ranking/controller/get-my-ranking-export.controller.ts` | #1, #2, #8, #11, #13 | [x] |
| 16 | `my-ranking.controller.ts` へルート追加（`getIcons`と`getMyRanking`の間に配置。※ルート衝突の必然性はPOSTのため薄いが、既存の静的パス優先の慣習に合わせて配置） | `backend/src/presentation/my-ranking/controller/my-ranking.controller.ts` | #15 | [x]（配置は変更なし） |
| 17 | presentationバレル更新 | `backend/src/presentation/my-ranking/controller/index.ts` | #15 | [x] |
| 18 | `npx tsc --noEmit` 確認 | ― | #1〜#17 | [x] |

## フロントエンド タスク

| # | タスク | ファイル | 前提 |
|---|--------|----------|------|
| 19 | ダウンロードユーティリティ（HTTPレスポンス由来のBlobをそのままaタグdownload。`.text()`はUTF-8 BOMを除去してしまうため文字列変換を経由しない） | `frontend/src/utils/download-blob-file.ts` | ― |
| 20 | エクスポートAPI呼び出し（POST、rpc経由の1回呼び出し。レスポンスの`Content-Type`ヘッダーで分岐: `application/json`ならメッセージを返す、`text/csv`なら`.text()`でCSV文字列を返す） | `frontend/src/features/my-ranking/api/export-my-ranking-csv.ts` | バックエンド#18 |
| 21 | 選択モード管理hook（`isSelectionMode`, `selectedIds`, `toggleSelectionMode`, `toggleSelect`, `selectAllOnPage`, `clearSelection`。ページ遷移時にリセットしない） | `frontend/src/features/my-ranking/hooks/use-my-ranking-selection.ts` | ― |
| 22 | CSV出力実行hook（`useMutation`で#20呼び出し→JSONメッセージが返った場合はtoastのみで終了→CSV文字列が返った場合は#19ダウンロード、実行中フラグ・エラーtoast） | `frontend/src/features/my-ranking/hooks/use-export-my-ranking-csv.ts` | #19, #20 |
| 23 | `RankingCard` 選択モード対応（選択モード時は左上にチェックボックス表示、カード全体クリックで選択トグル。右上お気に入りボタンは位置・機能とも現状維持。`ranking-card.test.tsx`にテストケース追加） | `frontend/src/features/my-ranking/components/ranking-card.tsx`, `frontend/src/features/my-ranking/components/ranking-card.test.tsx` | ― |
| 24 | `BulkActionBar` コンポーネント新規（選択モード中のみ件数表示・全選択（現在ページのみ）・キャンセル・CSV出力ボタンを表示。非選択時は`null`。選択モードの入口ボタン「一括選択」は`MyRankingSearchBar`側の検索ボタン右横に配置し、CSV出力機能のみのためPC（`lg:`＝1024px以上。`sm:`だとタブレットも含まれてしまうため）でのみ表示・モバイル/タブレットでは非表示とする） | `frontend/src/features/my-ranking/components/bulk-action-bar.tsx`, `frontend/src/features/my-ranking/components/my-ranking-search-bar.tsx` | ― |
| 25 | `use-my-ranking-list.ts` に#21, #22を組み込み | `frontend/src/features/my-ranking/hooks/use-my-ranking-list.ts` | #21, #22 |
| 26 | `MyRanking` に`BulkActionBar`設置、`RankingCard`へ選択モード関連props配線 | `frontend/src/features/my-ranking/components/my-ranking.tsx` | #23, #24, #25 |
| 27 | `MyRankingContainer` props配線確認 | `frontend/src/features/my-ranking/components/my-ranking-container.tsx` | #26 |
| 28 | `npx tsc --noEmit` 確認 | ― | #19〜#27 |

**削除された旧タスク**: 旧#15（`build-ranking-csv.ts`）・旧#24（そのユニットテスト）はCSV生成がバックエンドに移ったため不要。

---
合計: 28タスク（バックエンド 18 / フロントエンド 10）
推奨着手順: #10 → #11 → #12 → #13 → #14 → #15 → #16 → #17 → #18 → #19, #21 → #20 → #22 → #23, #24 → #25 → #26 → #27 → #28
