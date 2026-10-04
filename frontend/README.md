# RankingMaker フロントエンド

RankingMaker のフロントエンド（React + TypeScript + Vite）。

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | React 19 |
| ビルドツール | Vite |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| 状態管理 | React Query (TanStack Query) |
| ルーティング | React Router v7 |
| フォーム | React Hook Form + Zod |
| API通信 | Hono RPC クライアント（`lib/rpc-client.ts`。Axios はリフレッシュトークン専用） |
| テスト | Vitest + Testing Library |
| コンポーネントカタログ | Storybook |
| Linting | ESLint |

## セットアップ

### 前提条件

- Node.js 18以上
- npm 9以上

### インストール

```bash
# 依存関係のインストール
npm install

# 環境変数ファイルの作成
cp .env.example .env.development
```

### 環境変数

`.env.development` に以下の環境変数を設定してください：

| 変数名 | 説明 |
|--------|------|
| VITE_APP_API_URL | APIサーバーのベースURL |

## 開発

```bash
# 開発サーバー起動
npm run dev

# Storybook起動
npm run storybook

# テスト実行
npm run test

# 型チェック（バックエンドの型定義の生成も含む）
npm run typecheck

# Lintチェック
npm run lint

# ビルド
npm run build
```

## フォルダ構成

```
src/
├── app/                    # アプリケーションエントリポイント
│   ├── components/         # App, Router, ProtectedRoute等
├── components/             # 共通コンポーネント
│   ├── ui/                 # UIプリミティブ (Button, Textbox等)
│   ├── layouts/            # レイアウト・共通ダイアログ
│   └── pages/              # ページレベルコンポーネント (NotFound, Loading等)
├── config/                 # 設定 (paths, env)
├── constants/              # アプリ全体の定数・定数に対応する型（テーマ等）
├── features/               # 機能別モジュール（home, login, my-ranking, trash 等）
│   └── [feature]/
│       ├── api/            # API呼び出し（RPC）
│       ├── components/     # 機能固有コンポーネント（Container / Presentational）
│       ├── constants/      # 機能固有定数
│       ├── hooks/          # 機能固有フック
│       └── types/          # 機能固有型定義
├── hooks/                  # 共通カスタムフック
├── lib/                    # 外部ライブラリラッパー（RPC クライアント等）
├── stores/                 # グローバルな状態（アクセストークン等）
├── testing/                # テスト設定
└── utils/                  # ユーティリティ関数
```

## コーディング規約

- TypeScriptの厳密モード（strict: true）を使用
- コンポーネントはfunction宣言で定義
- スタイルはTailwind CSSのみ使用
- テストはVitestで記述
- パスエイリアス `@/` を使用（例: `import { Button } from '@/components'`）

## 新機能の追加手順

1. `src/features/` 配下に機能フォルダを作成
2. components, hooks, api, types を必要に応じて作成
3. ルーティングを `src/app/components/router.tsx` に追加
4. テストとStorybookを作成
