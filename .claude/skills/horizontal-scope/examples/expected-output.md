# Expected Output — 水平展開対象ファイル一覧

## 入力例

「カテゴリの一覧表示・作成機能を追加したい」

---

## 期待される出力

```
## 水平展開対象ファイル

### バックエンド（新規作成）
- `backend/src/infrastructure/db/schema.ts` — categoriesTable の定義を追加
- `backend/drizzle/` — マイグレーションファイルを新規生成（`db:generate` で作成）
- `backend/src/domain/category/category.ts` — ドメイン型定義
- `backend/src/domain/category/index.ts`
- `backend/src/api/category/repository/get-categories.repository.ts`
- `backend/src/api/category/repository/create-category.repository.ts`
- `backend/src/api/category/repository/index.ts`
- `backend/src/api/category/schema/create-category.schema.ts` — Zod バリデーション
- `backend/src/api/category/schema/index.ts`
- `backend/src/api/category/dto/get-categories-response.dto.ts`
- `backend/src/api/category/dto/create-category-response.dto.ts`
- `backend/src/api/category/dto/index.ts`
- `backend/src/api/category/controller/get-categories.controller.ts`
- `backend/src/api/category/controller/create-category.controller.ts`
- `backend/src/api/category/controller/category.controller.ts` — ルーター結合
- `backend/src/api/category/controller/index.ts`
- `backend/src/api/category/index.ts`

### バックエンド（既存ファイル修正）
- `backend/src/api/index.ts` — `export * from "./category"` を追加
- `backend/src/index.ts` — `.route("/", category)` を routes に追加

### フロントエンド（新規作成）
- `frontend/src/features/category/api/category.ts` — rpc 呼び出し関数
- `frontend/src/features/category/api/query-key.ts` — React Query キー定義
- `frontend/src/features/category/hooks/use-categories.ts` — 一覧取得 hook
- `frontend/src/features/category/hooks/use-create-category.ts` — 作成 hook
- `frontend/src/features/category/components/category-list/category-list.tsx` — Presentational
- `frontend/src/features/category/components/category-list/category-list-container.tsx` — Container
- `frontend/src/features/category/components/category-form/category-form.tsx` — Presentational
- `frontend/src/features/category/components/category-form/category-form-container.tsx` — Container
- `frontend/src/features/category/components/category/category.tsx` — ページルートコンポーネント
- `frontend/src/features/category/components/category/category-container.tsx` — Container

### フロントエンド（既存ファイル修正）
- `frontend/src/config/paths.ts` — category ページのパス定義を追加
- `frontend/src/app/components/router.tsx` — ルート登録を追加

---
合計: 28 ファイル（うち新規作成: 26）
```
