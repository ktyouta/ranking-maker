/**
 * D1 の1クエリあたりのバインドパラメータ上限
 */
export const D1_MAX_BOUND_PARAMETERS = 100;

/**
 * 同じクエリ内の他の条件・更新値に使うバインドパラメータの予約数
 */
const RESERVED_BOUND_PARAMETERS = 10;

/**
 * IN 句に渡す値の最大件数
 */
export const D1_MAX_IN_CLAUSE_VALUES = D1_MAX_BOUND_PARAMETERS - RESERVED_BOUND_PARAMETERS;
