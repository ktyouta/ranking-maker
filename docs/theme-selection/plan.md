# テーマカラー選択・ダークモード実装計画

## 前提

- 候補は「現状（teal）」「ラベンダー」「ピーチ」「ダークモード」の**4択フラット構成**（アクセントカラー×ライト/ダークの掛け合わせ6通りではない）。1ユーザーにつき1つの選択肢を持つ想定
- `docs/shared.md` の「検討して見送った案」で紫（Violet）系アクセントは一度不採用にしていたが、今回ラベンダー採用に方針転換する。あわせて shared.md の該当記載・ダークモードセクション（「将来対応時」→確定仕様）を更新する
- 今回はフロントエンドのみ実装する。DB永続化（ユーザーテーブルへのカラム追加）はスコープ外。選択状態は `localStorage` にのみ保存する
  - 永続化する場合は "1カラム（enumのような文字列）" を想定しているが、その設計・実装は別タスクとする
- 参考実装（別リポジトリ `todo-react-hono-rpc`）の `ThemeProvider`（React Context + `<html>` への属性切替 + `localStorage` キャッシュ）のパターンを踏襲する。ただし参考実装は `darkMode: 'class'` + 各コンポーネントへの `dark:` バリアント個別追加方式だが、本プロジェクトは色トークン自体が複数（`accent`/`canvas`/`ink`/`line`/`rank.*`）かつ4テーマ切替が必要なため、**CSS変数化 + `data-theme` 属性で一括切り替える方式**を採用する
  - `tailwind.config.js` の色定義を `rgb(var(--xxx-rgb) / <alpha-value>)` 形式に変更し、`index.css` 側で `[data-theme="..."]` ごとに変数値を定義する
- 調査の結果、`Dialog`・`Drawer`・`Table` 等の共通UIコンポーネントおよび一部 features が、セマンティックトークン（`bg-surface`/`text-ink`等）を経由せず Tailwind の汎用グレー（`bg-white`/`text-gray-*`）や固定hex（`#767676`等）を直書きしていることを確認した。これらを放置するとダークモード時に「ダイアログだけ白いまま」等の見た目になるため、**アプリ全体を対象にトークン化する**（ユーザー確認済み・全体対応を選択）
- テーマ選択UIは独立したナビ項目ではなく、ヘッダーのユーザーメニュー内（「ユーザー情報更新」「パスワード更新」と同列）に「テーマ設定」を追加し、既存の `Dialog` コンポーネントで4択を選ばせる。ナビ階層に紐付かないため `features/` ではなく `app/components/` に配置する

## テーマ基盤 タスク

| # | タスク | ファイル | 前提 |
|---|--------|----------|------|
| 1 | shared.md 更新（アクセント3色構成、紫不採用記載の見直し、ダークモード配色を確定仕様化） | `docs/shared.md` | ― |
| 2 | 色定義をCSS変数参照に変更 | `frontend/tailwind.config.js` | #1 |
| 3 | 4テーマ分のCSS変数定義（`[data-theme="teal"|"lavender"|"peach"|"dark"]`） | `frontend/src/index.css` | #1 |
| 4 | ThemeProvider新規作成（Context + `data-theme`属性切替 + localStorage） | `frontend/src/app/components/theme-provider.tsx` | #2, #3 |
| 5 | App に ThemeProvider を適用 | `frontend/src/app/components/app.tsx` | #4 |

## 共通UIコンポーネントのトークン置き換え タスク

| # | タスク | ファイル | 前提 |
|---|--------|----------|------|
| 6 | 固定グレーをトークン化 | `frontend/src/components/ui/dialog/dialog.tsx` | #2, #3 |
| 7 | 固定グレーをトークン化 | `frontend/src/components/ui/drawer/drawer.tsx` | #2, #3 |
| 8 | 固定グレーをトークン化 | `frontend/src/components/ui/textarea/textarea.tsx` | #2, #3 |
| 9 | 固定グレーをトークン化 | `frontend/src/components/ui/table/table.tsx` | #2, #3 |
| 10 | 固定グレーをトークン化 | `frontend/src/components/ui/breadcrumb/breadcrumb.tsx` | #2, #3 |
| 11 | 固定hex(`#c0c0c0`等)をトークン化 | `frontend/src/components/ui/date-picker/date-picker.tsx` `frontend/src/components/ui/date-picker/date-picker.css` | #2, #3 |
| 12 | 固定hex(`#767676`)をトークン化 | `frontend/src/components/ui/textbox/textbox.tsx` | #2, #3 |
| 13 | 固定hex(`#767676`)をトークン化 | `frontend/src/components/ui/select/select.tsx` | #2, #3 |
| 14 | 固定グレー/hex箇所をトークン化（`bg-canvas`/`bg-accent`利用箇所は維持） | `frontend/src/components/layouts/dashboard/dashboard.tsx` | #2, #3 |
| 15 | 固定グレーをトークン化 | `frontend/src/components/pages/notfound/not-found.tsx` | #2, #3 |

## features側のトークン置き換え タスク

| # | タスク | ファイル | 前提 |
|---|--------|----------|------|
| 16 | 固定グレーをトークン化 | `frontend/src/features/my-ranking/components/my-ranking-detail-edit.tsx` | #2, #3 |
| 17 | 固定グレーをトークン化 | `frontend/src/features/create-ranking/components/create-ranking.tsx` | #2, #3 |
| 18 | 固定グレーをトークン化 | `frontend/src/features/updatepassword/components/update-password.tsx` | #2, #3 |
| 19 | 固定グレーをトークン化 | `frontend/src/features/updateuser/components/update-user.tsx` | #2, #3 |
| 20 | 固定グレーをトークン化 | `frontend/src/features/signup/components/signup.tsx` | #2, #3 |
| 21 | 固定グレーをトークン化 | `frontend/src/features/login/components/login.tsx` | #2, #3 |

## テーマ選択UI タスク

| # | タスク | ファイル | 前提 |
|---|--------|----------|------|
| 22 | ThemeSelectDialog新規作成（4択をDialogで表示、選択でContextのsetter呼び出し） | `frontend/src/app/components/theme-select-dialog.tsx` | #4, #6 |
| 23 | ユーザーメニューに「テーマ設定」項目追加、ダイアログ開閉状態を保持 | `frontend/src/components/layouts/dashboard/dashboard.tsx` `frontend/src/app/components/dashboard-container.tsx` | #22 |

## 確認・テスト タスク

| # | タスク | ファイル | 前提 |
|---|--------|----------|------|
| 24 | Storybookでの見た目確認 | `dialog.stories.tsx` `drawer.stories.tsx` `table.stories.tsx` | #6〜#10 |
| 25 | 既存テストへの影響確認 | `frontend/src/components/layouts/dashboard/dashboard.test.tsx` | #23 |

---
合計: 25 タスク
推奨着手順: #1 → #2, #3 → #4 → #5 → #6〜#15 → #16〜#21 → #22 → #23 → #24 → #25

## 実施結果

- #1〜#13, #15, #18〜#23, #25: 計画通り実装完了
- #14（dashboard.tsx）: 調査の結果、`bg-white/20`等は「アクセント色のサイドバー上に載る白系オーバーレイ」で shared.md 仕様上どのテーマでも固定が正しいため、変更不要と判断（対応済み扱い）
- #16, #17（my-ranking-detail-edit.tsx, create-ranking.tsx）: 該当の `bg-white` はコメントアウト済みの未使用コードのみだったため、変更不要と判断（対応済み扱い）
- #22: `theme-select-dialog.tsx`（Presentational）と `theme-select-dialog-container.tsx`（Container、新規追加）の2ファイルに分割して実装。Context読み取りをContainer側に寄せ、既存の Dashboard/DashboardContainer と同じ分離パターンに揃えた
- #24（Storybook確認）: **未実施**。dev server / Storybook起動の許可を得ていないため、`*.stories.tsx` の実物確認はスキップした。`dialog.stories.tsx` `drawer.stories.tsx` `table.stories.tsx` 自体のハードコード色（`bg-gray-*` 等）はデモ用コンテンツと判断し今回のトークン化対象からも除外している
- 計画外だが同種の問題として追加対応: `components/pages/errors/errors.tsx` の `text-blue-500` を `text-accent` に修正（`not-found.tsx` と同種のリンク文言だったため）
- `tailwind.config.js` に `borderColor.DEFAULT` / `ringColor.DEFAULT` を追加し、色指定のない `border`/`focus:ring-2` をアプリ全体で `line`/`accent` トークンに追従させた（Table等の個別修正だけでは拾えない箇所を一括カバーする基盤強化。#2の一部として実施）
- `npx tsc --noEmit` 型エラー0件、既存テスト57件全てパスを確認済み。dev server起動によるブラウザ上の目視確認は未実施（指示によりスキップ）
- **追加修正1（ユーザーによる実機確認後）**: ダークモードのサイドバー（`dashboard.tsx` の `bg-accent` 全面塗り）が明るすぎるとの指摘。`accent`（小面積用）と `accent-surface`（大面積の全面塗り専用、ダークのみ暗く別値）を分離して対応
- **追加修正2（さらなる実機確認後）**: 検索ボタン・ランキングカードのアイコンバッジ等、他の「単色塗りつぶし」箇所にも同じ問題が残っていると指摘。参考実装（別リポジトリ `todo-react-hono-rpc`）を再確認したところ、ボタン・バッジ・サイドバーを含む塗りつぶし全般を一貫してダーク時に暗く沈める設計だったため、`accent-surface` の適用範囲をサイドバー限定から**塗りつぶし用途全般**に拡大。`--accent-surface-hover-rgb` / `accent.surface-hover` トークンを追加し、`button.tsx`（colorType="accent"）・`pagination.tsx`（選択中ページ）・各画面の送信ボタン（ログイン/サインアップ/ユーザー情報更新/パスワード更新/ランキング作成・編集/ゴミ箱の復元・完全削除）・アイコンバッジ（ホーム/ランキングカード/ゴミ箱カード）・件数バッジ（検索バーの詳細フィルター）の `bg-accent`+`text-white` を `bg-accent-surface`（+hover）に置換。文字色・細いボーダー・低opacityの装飾（`text-accent` `border-accent` `bg-accent/NN`）は明るいアクセントのまま維持
- **追加修正3（それでも「サイドバー等が全然踏襲できていない」と指摘）**: 根本原因は明度ではなく配色方針のズレだった。ダークモードの背景・罫線・テキストを「teal色相を保ったまま明度を振る」方式で機械導出していたため（`#0B1716`等）、参考実装（背景はニュートラルなgray-900/800、アクセントはcyan-400/900のみ）と系統が異なっていた。ダークモードのみ、参考実装の値をそのまま踏襲する形に変更（`index.css` の `[data-theme="dark"]` ブロックを gray-900/800 + cyan-400/300/900 系の値に置き換え）。`docs/shared.md` のダークモード列・検討経緯も更新済み
- ダイアログの選択肢ラベル「現状（teal）」は色の名称になっていないとの指摘で「ティール」に修正（`theme-select-dialog.tsx`）
- **追加修正4**: 「Ranking Maker」ロゴ、ランキング/ゴミ箱カードのタイトル左の太い縦線、各一覧の空状態の大アイコンが依然として明るいとの指摘。いずれも「小さいリンク用の明るいaccentを、目立たせたい装飾要素に使っていた」ケースだったため `accent-surface` に変更
- **追加修正5**: 「Ranking Maker」ロゴはダークモードのみ白にしたいとの指定。ライト3テーマ用途（accentと同値）とダーク用途（白固定）が両立しないため、ロゴ専用の `brand` トークン（`--brand-rgb`）を新設し、`dashboard.tsx` のロゴだけ `text-brand` に変更
