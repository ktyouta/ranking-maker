---
name: backend-review
description: |
  バックエンドのコード変更が完了した直後に、レイヤー設計・単一責務の観点でチェックを行う。

  以下のような場合に必ず呼び出す：
  - バックエンドの Controller / Service / Repository を新規作成・修正したとき
  feature-impl / feature-modify / bug-fix / refactor を経由しない実装（plan.md ベースの手動実装等）でも、上記の条件を満たす変更を行った場合は必ず実行すること。

  以下の場合は使用しない：
  - フロントエンドのみの変更
  - 調査・説明・設計相談のみの場合
version: 1.0.0
---

# Backend Review Skill

## Overview

バックエンド実装後に、レイヤー設計・単一責務の違反パターンをチェックする。

**呼び出し条件（必須）**
- バックエンドの Controller / Service / Repository を新規作成・修正したとき
- feature-impl / feature-modify / bug-fix / refactor を経由しない手動実装でも、上記条件を満たす変更を行った場合は必ず実行すること

**対象外**
- フロントエンドのみの変更
- 調査・説明・設計相談のみの場合

---

## Check Instructions

### Controller 単一責務
- Controller 内にビジネスロジック・データ変換処理が直書きされていないか
- 処理の流れが上から順に読めるか（コメントや命名で各ステップの概要が把握できるか）
- Service 呼び出しの順序でエンドポイントの処理概要が理解できるか

### Service メソッド設計
- Controller から呼ばれる処理単位でメソッドに切り出されているか
- DB に触れない純粋なビジネスロジック（バリデーション・計算処理等）もメソッドとして定義されているか
- Repository を直接呼ぶだけのメソッドであっても、名前付きメソッドとして切り出されているか
- Controller が単一の `service.xxx()` 呼び出しで完結していないか確認する
  - アンチパターン: `service.checkout()` 1つがデータ取得・エンティティ構築・分岐・DB操作をすべて担っている
  - 正しいパターン: `getCurrentState` / `insert` / `update` に分割し、Controller の呼び出し順でフローが読める
- ロジックを含まない処理が Service メソッドになっていないか
  - ロジックの例（例示であって網羅ではない）: 条件分岐・ループ・計算・DB アクセス
  - アンチパターン: `service.buildEntity()` のような、内部で単に `new Entity(...)` するだけのメソッドを Service に定義している
  - 正しいパターン: Controller で直接 `new SomeEntity(...)` する（ロジックを含まない単純な構築・変換は Controller で直接行う）

### フォルダ・ファイル構成
- `src/api/[機能グループ名]/` 単位でフォルダが切られているか
- 各レイヤーのファイルが `[操作名].[レイヤー].ts` の命名でエンドポイント単位に分割されているか
- ルーター集約ファイルが `[機能グループ名].controller.ts` になっているか
- repository に対応する `.repository.interface.ts` がセットで存在するか
- 各レイヤーフォルダに `index.ts` が存在するか

### コーディング規約
- ユーティリティ関数（日付変換・文字列変換等）を Service / Controller 内に直接定義していないか
  - 実装前に `src/util/` 配下の既存関数と重複がないか確認すること
  - 複数ファイルで同じ関数が定義されている場合は `src/util/` に集約する
- `if` 文が1行でも中括弧 `{ }` を省略していないか。また処理が1行でも `{ return; }` のように同一行に収めず、改行して記述されているか
- non-null アサーション（`!`）を使っていないか
  - アンチパターン: `const user = c.get("user")!;` / `const entry = map.get(key)!;` など `.get()` 系メソッド全般
  - 正しいパターン: `const user = c.get("user"); if (!user) { return c.json(...); }` / `const entry = map.get(key); if (!entry) { continue; }` のように明示的ガード節で処理する
- メソッド名にパラメータ情報（`ById`・`ByName` 等）が含まれていないか（複数パラメータで識別が必要な場合は除く）
- クラス・メソッドに `@param` / `@returns` を含む複数行 JSDoc 形式のコメントがあるか（単行 `/** 説明 */` は不可）
- コントローラーのセクション区切りコメントに実装詳細が含まれていないか（「どこから取得するか」等の記述がないか）
- マジックナンバーが直接記述されていないか（名前付き定数に切り出すこと。定数値は意図が読み取れる形で書く）
- `c.json({ message, data })` の `message` が `"OK"` のままになっていないか（ヘルスチェックを除く業務エンドポイントはエンドポイントごとの日本語メッセージを返すこと）
- `domain/` に対応する値オブジェクトが存在する場合、raw union 型や `string` 型を直接使っていないか
  - メソッドコードだけでなく、**新規定義した params 型・record 型のフィールド**も対象に含める（例: `itemId: string` ではなく `ItemId` 型を使う）
- 既存のドメイン型をその型が表す意味と異なる概念に流用していないか（例: あるドメイン型の `generate()` を、その型とは無関係な概念の ID・値の生成に使用する）
- `string` 型を使っているフィールドのうち、対応するドメイン型を新規作成すべきものが残っていないか

### Repository 単一操作
- Repository の1メソッドが複数のDB操作を行っていないか（1メソッド1操作）
- テーブル操作（SELECT / INSERT / UPDATE / DELETE）はすべて Repository に集約されているか
- Service・Controller に Drizzle ORM の直接呼び出しが混入していないか
- Repository ファイルがエンドポイント単位でまとまっているか
  - アンチパターン: `get-xxx.repository.ts`（SELECT）・`create-xxx.repository.ts`（INSERT）のように操作種別でファイルを分けている
  - 正しいパターン: `create-xxx.repository.ts` に SELECT / INSERT / UPDATE をまとめて定義している（エンドポイントが必要とする全DB操作を1ファイルに集約）
  - 異なるエンドポイント間で同じDB操作が重複しても共通化しない

---

## Constraints

- Cloudflare D1 は `db.transaction()` をサポートしない。複数操作のアトミック実行には必ず `db.batch([` を使う
  - 同一 Repository 内の複数操作: Repository メソッド内で `db.batch([` を使う
  - 複数 Repository をまたぐ場合: Controller で `db.batch([` を使う（Service に持たせる必然性がないため）

---

## Procedure

1. 変更されたバックエンドファイルを確認する
2. Controller / Service / Repository のレイヤーを特定する
3. 各チェック項目を照合する
4. 以下の形式で報告する

---

## Output Format

違反がある場合：

```
## Backend Review 結果

### 違反あり
- **ファイル**: [ファイルパス:行番号]
- **違反内容**: 具体的な問題
- **修正方針**: 修正の方向性
```

違反がない場合：

```
## Backend Review 結果

チェック完了。問題なし。
```
