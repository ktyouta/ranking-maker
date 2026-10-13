import type { ItemMemoError, ItemNameError, OrderError, PublicStatusError, RankingIconError, RankingIdError, RankingListPaginationError, RankingMemoError, RankingSortError, RankingTitleError, RankingValidationError, TagNameError, TrashRankingSortError } from "../../../../domain";

/**
 * マイランキングコンテキストの入力値の違反（値オブジェクトの制約違反、集約の不変条件の違反、絞り込みタグ・ランキングIDの件数の違反）
 */
type MyRankingInputError =
  | RankingTitleError
  | PublicStatusError
  | RankingIconError
  | RankingMemoError
  | ItemNameError
  | OrderError
  | ItemMemoError
  | TagNameError
  | RankingSortError
  | TrashRankingSortError
  | RankingListPaginationError
  | RankingIdError
  | RankingValidationError
  | { type: "TOO_MANY_FILTER_TAGS"; max: number }
  | { type: "EMPTY_RANKING_IDS" }
  | { type: "TOO_MANY_RANKING_IDS"; max: number };

/**
 * 入力値の違反を、利用者向けのメッセージに変換する
 * @param error ドメインが返した入力値の違反
 * @returns 利用者向けのメッセージ
 */
export function toInputErrorMessage(error: MyRankingInputError): string {
  switch (error.type) {
    case "RANKING_TITLE_EMPTY":
      return "タイトルは必須です";
    case "RANKING_TITLE_TOO_LONG":
      return `タイトルは${error.max}文字以内で入力してください`;
    case "PUBLIC_STATUS_INVALID":
      return "公開ステータスが不正です";
    case "RANKING_ICON_INVALID":
      return "アイコンIDが不正です";
    case "RANKING_MEMO_TOO_LONG":
      return `メモは${error.max}文字以内で入力してください`;
    case "ITEM_NAME_TOO_LONG":
      return `項目名は${error.max}文字以内で入力してください`;
    case "ORDER_INVALID":
      return `順位は${error.min}以上の整数で入力してください`;
    case "ITEM_MEMO_TOO_LONG":
      return `メモは${error.max}文字以内で入力してください`;
    case "TAG_NAME_EMPTY":
      return "タグは必須です";
    case "TAG_NAME_TOO_LONG":
      return `タグは${error.max}文字以内で入力してください`;
    case "TAG_NAME_INVALID_CHARACTER":
      return `タグに「${error.separator}」は使えません`;
    case "RANKING_SORT_INVALID":
    case "TRASH_RANKING_SORT_INVALID":
      return "並び順が不正です";
    case "RANKING_LIST_PAGE_INVALID":
      return `ページ番号は${error.min}以上の整数で指定してください`;
    case "DUPLICATE_ITEM_NAME":
      return `名称が重複しています: ${error.itemName}`;
    case "DUPLICATE_ORDER":
      return `順位が重複しています: ${error.order}`;
    case "DUPLICATE_TAG":
      return "同じタグが複数指定されています";
    case "TOO_MANY_TAGS":
      return `タグは${error.maxCount}個までです`;
    case "TOO_MANY_FILTER_TAGS":
      return `タグは${error.max}個までです`;
    case "RANKING_ID_EMPTY":
      return "ランキングIDが不正です";
    case "EMPTY_RANKING_IDS":
      return "ランキングを選択してください";
    case "TOO_MANY_RANKING_IDS":
      return `選択できるランキングは${error.max}件までです`;
    default: {
      // 全てのエラー種別を網羅していることを型で保証する
      error satisfies never;
      return "入力内容が不正です";
    }
  }
}
