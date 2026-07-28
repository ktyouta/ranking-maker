# Expected Output — 実装タスク分解

## 入力例

「カテゴリの一覧表示・作成機能を追加したい。カテゴリ名を登録でき、一覧で確認できる」

---

## 期待される出力

```
## 実装タスク分解

### バックエンド

| # | タスク | ファイル | 前提 |
|---|--------|----------|------|
| 1 | categories テーブル定義追加 | `backend/src/infrastructure/db/schema.ts` | ― |
| 2 | マイグレーション生成 | `backend/drizzle/` | #1 |
| 3 | Category ドメイン型定義 | `backend/src/domain/category/category.ts` | ― |
| 4 | GetCategoriesRepository 実装 | `backend/src/api/category/repository/get-categories.repository.ts` | #1 |
| 5 | CreateCategoryRepository 実装 | `backend/src/api/category/repository/create-category.repository.ts` | #1 |
| 6 | CreateCategorySchema 定義（Zod） | `backend/src/api/category/schema/create-category.schema.ts` | ― |
| 7 | DTO 定義（一覧・作成） | `backend/src/api/category/dto/get-categories-response.dto.ts` `backend/src/api/category/dto/create-category-response.dto.ts` | #3 |
| 8 | GetCategoriesController 実装 | `backend/src/api/category/controller/get-categories.controller.ts` | #4, #7 |
| 9 | CreateCategoryController 実装 | `backend/src/api/category/controller/create-category.controller.ts` | #5, #6, #7 |
| 10 | CategoryController（ルーター結合） | `backend/src/api/category/controller/category.controller.ts` | #8, #9 |
| 11 | api/index.ts へのエクスポート追加 | `backend/src/api/index.ts` | #10 |
| 12 | index.ts へのルート登録 | `backend/src/index.ts` | #11 |

### フロントエンド

| # | タスク | ファイル | 前提 |
|---|--------|----------|------|
| 13 | paths.ts にパス定義追加 | `frontend/src/config/paths.ts` | ― |
| 14 | rpc 呼び出し関数・Query Key 定義 | `frontend/src/features/category/api/category.ts` `frontend/src/features/category/api/query-key.ts` | バックエンド #12 |
| 15 | useCategories hook（一覧取得） | `frontend/src/features/category/hooks/use-categories.ts` | #14 |
| 16 | useCreateCategory hook（作成） | `frontend/src/features/category/hooks/use-create-category.ts` | #14 |
| 17 | CategoryList コンポーネント（Presentational） | `frontend/src/features/category/components/category-list/category-list.tsx` | ― |
| 18 | CategoryListContainer（hooks と接続） | `frontend/src/features/category/components/category-list/category-list-container.tsx` | #15, #17 |
| 19 | CategoryForm コンポーネント（Presentational） | `frontend/src/features/category/components/category-form/category-form.tsx` | ― |
| 20 | CategoryFormContainer（hooks と接続） | `frontend/src/features/category/components/category-form/category-form-container.tsx` | #16, #19 |
| 21 | CategoryContainer（ページルート） | `frontend/src/features/category/components/category/category-container.tsx` | #18, #20 |
| 22 | router.tsx へのルート登録 | `frontend/src/app/components/router.tsx` | #13, #21 |

---
合計: 22 タスク（バックエンド 12 / フロントエンド 10）
推奨着手順: #1 → #2 → #3, #4, #5, #6 → #7 → #8, #9 → #10 → #11 → #12 → #13, #14 → #15, #16 → #17, #19 → #18, #20 → #21 → #22
```
