/**
 * 配列を指定件数ごとに分割する
 * @param values 分割対象の配列
 * @param size 1つあたりの最大件数
 * @returns 分割後の配列一覧（元の配列が空の場合は空配列）
 */
export function chunk<T>(values: T[], size: number): T[][] {
    if (!Number.isInteger(size) || size <= 0) {
        throw new Error(`分割件数が不正です: ${size}`);
    }

    const chunks: T[][] = [];
    for (let i = 0; i < values.length; i += size) {
        chunks.push(values.slice(i, i + size));
    }

    return chunks;
}
