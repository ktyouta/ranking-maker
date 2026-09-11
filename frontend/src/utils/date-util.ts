type DateFormat = 'yyyy-MM-dd HH:mm:ss' | 'yyyy/MM/dd' | 'HH:mm:ss' | 'dd-MM-yyyy HH:mm' | 'yyyyMMdd' | 'yyyyMMddHHmmss';

/**
 * 現在日時を取得
 */
export function getNowDatetime(format: DateFormat) {
    return getFormatDatetime(new Date(), format);
}

/**
 * 日付をフォーマット変換する
 * @param date 
 * @param format 
 * @returns 
 */
export function getFormatDatetime(date: Date, format: DateFormat): string {

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = (date.getDate()).toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    let retDate = "";

    if (format === 'yyyyMMdd') {
        retDate = `${year}${month}${day}`;
    }
    else {

        retDate = format.replace('yyyy', String(year))
            .replace('MM', String(month).padStart(2, '0'))
            .replace('dd', String(day).padStart(2, '0'))
            .replace('HH', String(hours).padStart(2, '0'))
            .replace('mm', String(minutes).padStart(2, '0'))
            .replace('ss', String(seconds).padStart(2, '0'));
    }

    return retDate;
}

/**
 * 現在日付(yyyyMMdd)を取得する
 * @param format 
 * @returns 
 */
export function getNowDateYYYYMMDD() {
    return getFormatDatetime(new Date(), 'yyyyMMdd');
}

/**
 * 日付を YYYY/MM/DD 形式に整形する
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}/${month}/${day}`;
}

/**
 * 日付を「今日」「n日前」の相対表記に変換する
 */
export function formatDaysAgo(dateString: string): string {
    const target = new Date(dateString);
    const now = new Date();
    const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.round((nowDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
        return '今日';
    }
    return `${diffDays}日前`;
}