# Expected Output — Backend Review

---

## ケース1: 違反あり（Controller にビジネスロジック）

### 状況
- Controller 内で条件分岐・データ変換を直接行っている

### 出力

```
## Backend Review 結果

### 違反あり
- **ファイル**: backend/src/presentation/item/controller/create-item.controller.ts:18
- **違反内容**: 「同名のアイテムが既に存在するか」の判定ロジックが Controller に直書きされている
- **修正方針**: Usecase メソッド `findByName()` に切り出し、Controller は呼び出し結果で分岐する
```

---

## ケース2: 違反あり（Repository がエンドポイント単位でまとまっていない）

### 状況
- `get-item.repository.ts`（SELECT）と `create-item.repository.ts`（INSERT）に分かれている

### 出力

```
## Backend Review 結果

### 違反あり
- **ファイル**: backend/src/infrastructure/item/repository/
- **違反内容**: Repository が操作種別（SELECT / INSERT）でファイル分割されている
- **修正方針**: `create-item.repository.ts` に SELECT / INSERT をまとめ、`get-item.repository.ts` は削除する
```

---

## ケース3: 違反あり（JSDoc が単行形式）

### 状況
- Usecase メソッドのコメントが `/** 説明 */` の1行形式になっている

### 出力

```
## Backend Review 結果

### 違反あり
- **ファイル**: backend/src/application/item/usecase/create-item.usecase.ts:10
- **違反内容**: JSDoc が単行形式（`/** 説明 */`）になっている。`@param` / `@returns` を含む複数行形式が必要
- **修正方針**: 以下の形式に変更する
  ```ts
  /**
   * 説明
   * @param userId
   * @returns
   */
  ```
```

---

## ケース4: 違反あり（Controller/Usecase が db.batch を直接組み立てている）

### 状況
- ユーザー登録エンドポイントで、Controller が `db.batch([db.insert(userMaster)..., db.insert(userLoginMaster)...])` を直接呼んでいる

### 出力

```
## Backend Review 結果

### 違反あり
- **ファイル**: backend/src/presentation/user/controller/create-user.controller.ts:53
- **違反内容**: Controller が Repository を経由せず `db.batch` と Drizzle のクエリビルダーを直接呼び出している。Repository に定義済みの `insertUser` / `insertLoginUser` も使われず未使用のままになっている
- **修正方針**: `IUserRepository` に `createUserWithLogin(user, login): Promise<void>` を1メソッドとして定義し、その内部で `db.batch` を完結させる。Usecase はこの1メソッドを呼ぶだけにし、Controller・Usecase から Drizzle への直接依存を除去する
```

---

## ケース5: 違反あり（VO命名がフォルダ内で不整合／自己参照的な生成）

### 状況
- `domain/user/value-object/theme/theme.ts` に `Theme` という新規VOを作成した
- 同じ `domain/user/value-object/` 配下には `UserId`/`UserName`/`UserBirthday` があり、全て `User` プレフィックスが付いている
- デフォルト値生成のため呼び出し側で `new Theme(Theme.LAVENDER)` としている

### 出力

```
## Backend Review 結果

### 違反あり
- **ファイル**: backend/src/domain/user/value-object/theme/theme.ts:1
- **違反内容**: `domain/user/value-object/` 配下の既存VO（`UserId`/`UserName`/`UserBirthday`）は全て `User` プレフィックスが付いているが、`Theme` だけプレフィックスがなく命名が不整合
- **修正方針**: `UserTheme` にリネームする（フォルダも `user-theme/user-theme.ts` に揃える）

### 違反あり
- **ファイル**: backend/src/application/user/usecase/create-user.usecase.ts:39
- **違反内容**: `new Theme(Theme.LAVENDER)` という自己参照的な生成になっている。`Theme` は「値検証によるインスタンス化」と「デフォルト値生成」という2つの生成意味を持つが、`public constructor` のみで表現されている
- **修正方針**: `UserId` の `static generate()`/`static of()` と同様に `private constructor` + `static of(value)` / `static default()` に分離する
```

---

## ケース6: 問題なし

### 出力

```
## Backend Review 結果

チェック完了。問題なし。
```
