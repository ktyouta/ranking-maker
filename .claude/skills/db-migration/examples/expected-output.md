# Expected Output — DB マイグレーション

---

## ケース1（NG）: 生成された SQL に、子孫テーブルを持つテーブルの DROP TABLE がある

### 状況
`user_master.birthday` を NOT NULL にするため `db:generate` を実行したところ、`user_master` を作り直す SQL が生成された。
`user_master` は `user_login_master`・`tag_master`・`ranking_master` などから ON DELETE CASCADE で参照されている。

### 期待する対応
適用せずに、ユーザーへ次のように報告し、Step 3 の退避・戻しを足す。

```
生成された 0013_wakeful_starhawk.sql は user_master を作り直します（DROP TABLE を含みます）。
このまま適用すると、次の子孫テーブルの行が CASCADE で全件削除されます。

- user_login_master
- user_google_login_master
- tag_master
- ranking_master
  - ranking_order_master
  - ranking_tag_master（tag_master からも参照）

子孫テーブルを退避して戻す処理を SQL に足してから、使い捨て D1 で検証します。
```

### NG の対応（してはいけない）
- 生成された SQL を確認せずに `npm run db:migrate:local` を実行する
- 「PRAGMA foreign_keys=OFF が入っているので大丈夫」と判断する
- 適用後に `user_master` の件数だけを見て「そのまま移行できました」と報告する

---

## ケース2（NG）: 確認スクリプトで止められた

### 状況
`npm run db:migrate:local` を実行したところ、pre スクリプトが次のように出力して止まった。

```
[migration-check] 0013_wakeful_starhawk.sql は適用できません。
  - user_master を DROP すると子孫テーブル ranking_master の行が CASCADE で削除されるが、退避（CREATE TABLE __bak_ranking_master AS SELECT * FROM ranking_master） がない
  - 適用後に ranking_master の件数が 1 件から 0 件に減った
```

### 期待する対応
確認スクリプトを回避せず、Step 3 に戻って退避・戻しを足し、Step 4 の検証をやり直す。

### NG の対応（してはいけない）
- `npm run db:migrate:local --ignore-scripts` や `wrangler d1 migrations apply` の直接実行で回避する
- 止められた内容をユーザーに伝えずに SQL を書き換えて進める

---

## ケース3（OK）: 退避・戻しを足して検証し、適用した

### 状況
ケース1の SQL に退避・戻しを足し、Step 4 の検証がすべて通った。ユーザーに断ってから `npm run db:migrate:local` を実行した。

### 期待する出力

```
## マイグレーション適用結果

- **適用したマイグレーション**: 0013_wakeful_starhawk.sql
- **作り直したテーブル**: user_master
- **件数の比較**:
  | テーブル | 適用前 | 適用後 |
  |---|---|---|
  | user_master | 2 | 2 |
  | user_login_master | 2 | 2 |
  | user_google_login_master | 0 | 0 |
  | tag_master | 3 | 3 |
  | ranking_master | 8 | 8 |
  | ranking_order_master | 25 | 25 |
  | ranking_tag_master | 4 | 4 |
- **検証**: db:check:local 問題なし / 本番の適用状態（0011 まで適用済み）での検証 問題なし / db:generate No schema changes / テスト 全件通過
- **本番について**: 未適用です。この変更をコミットしてから `npm run db:migrate:prod` を実行してください。
```
