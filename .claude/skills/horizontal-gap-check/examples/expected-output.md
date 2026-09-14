# Expected Output — 水平展開漏れチェック結果

## 入力例①（自律実行：Claude が実装を完了した直後）

Claude がカテゴリ機能のバックエンド実装を完了した直後に自動実行。
`git diff` から変更済みファイルを把握する。

---

## 期待される出力（漏れあり）

```
## 水平展開漏れチェック結果

### 変更済みファイル（git diff より）
- `backend/src/infrastructure/db/schema.ts`
- `backend/src/domain/category/` （全ファイル）
- `backend/src/infrastructure/category/` （全ファイル）
- `backend/src/application/category/` （全ファイル）
- `backend/src/presentation/category/` （全ファイル）
- `backend/src/index.ts`

### 漏れあり

#### バックエンド
- `backend/drizzle/` — マイグレーションファイルの生成が必要（`db:generate` 未実行）

#### フロントエンド
- `frontend/src/features/category/api/category.ts` — rpc 呼び出し関数が未作成
- `frontend/src/features/category/api/query-key.ts` — React Query キー定義が未作成
- `frontend/src/features/category/hooks/use-categories.ts` — 一覧取得 hook が未作成
- `frontend/src/features/category/hooks/use-create-category.ts` — 作成 hook が未作成
- `frontend/src/features/category/components/category-list/category-list.tsx` — Presentational が未作成
- `frontend/src/features/category/components/category-list/category-list-container.tsx` — Container が未作成
- `frontend/src/features/category/components/category-form/category-form.tsx` — Presentational が未作成
- `frontend/src/features/category/components/category-form/category-form-container.tsx` — Container が未作成
- `frontend/src/features/category/components/category/category.tsx` — ページルートコンポーネントが未作成
- `frontend/src/features/category/components/category/category-container.tsx` — Container が未作成
- `frontend/src/config/paths.ts` — category ページのパス定義が未追加
- `frontend/src/app/components/router.tsx` — ルート登録が未追加

---
漏れ: 13 ファイル
```

---

## 入力例②（ユーザー報告）

ユーザーが「カテゴリ機能を実装した」と報告。

---

## 期待される出力（漏れなし）

```
## 水平展開漏れチェック結果

漏れなし。水平展開は完了しています。
```

---

## 入力例③（原因調査で判明した「導入時点から不要だった値」の横展開）

Claude がバグ修正で `frontend/src/features/my-ranking/components/ranking-card.tsx` の
不要な `relative z-10` を削除。原因調査で、この値は `88374d4`（Simplify ranking and trash list cards）
というコミットで導入時点から機能的に不要なまま付与されていたことが判明している。

---

## 期待される出力（漏れあり）

```
## 水平展開漏れチェック結果

### 変更済みファイル（git diff より）
- `frontend/src/features/my-ranking/components/ranking-card.tsx`

### 導入コミットの確認
- `relative z-10` の導入コミット: `88374d4`（Simplify ranking and trash list cards）
- `git show 88374d4 --stat` で同時に変更された他ファイルを確認

### 漏れあり

#### フロントエンド
- `frontend/src/features/trash/components/trash-card.tsx` — 同じ `88374d4` で同時に `relative z-10` が付与されており、trash-card には absolute 配置の子要素が存在しないため同様に不要

---
漏れ: 1 ファイル
```
