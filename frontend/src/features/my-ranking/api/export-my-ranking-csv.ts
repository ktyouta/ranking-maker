import { rpc } from '@/lib/rpc-client';
import { useMutation } from '@tanstack/react-query';

const endpoint = rpc.api.v1['my-ranking'].export.$post;

const DEFAULT_EXPORT_FILENAME = 'ranking_export.csv';

export type ExportMyRankingCsvResultType =
    | { isEmpty: true; message: string }
    | { isEmpty: false; csvBlob: Blob; filename: string };

type PropsType = {
    onSuccess: (result: ExportMyRankingCsvResultType) => void;
    onError: (message: string) => void;
};

/**
 * Content-Disposition ヘッダーからファイル名を取り出す
 */
function extractFilename(contentDisposition: string | null): string {
    const match = contentDisposition?.match(/filename="([^"]+)"/);
    return match?.[1] ?? DEFAULT_EXPORT_FILENAME;
}

/**
 * ランキングCSVエクスポートAPI呼び出し hook
 * レスポンスの Content-Type で分岐する（0件時: JSONメッセージ、それ以外: CSV本文）
 */
export function useExportMyRankingCsvMutation(props: PropsType) {
    return useMutation({
        mutationFn: async (ids: string[]): Promise<ExportMyRankingCsvResultType> => {

            const res = await endpoint({ json: { ids } });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message);
            }

            const contentType = res.headers.get('content-type') ?? '';

            if (contentType.includes('application/json')) {
                const { message } = await res.json();
                return { isEmpty: true, message };
            }

            // res.text() は UTF-8 BOM を自動的に除去してしまうため、生バイト列を保持できる res.blob() を使う
            const csvBlob = await res.blob();
            const filename = extractFilename(res.headers.get('content-disposition'));

            return { isEmpty: false, csvBlob, filename };
        },
        onSuccess: (result) => {
            props.onSuccess(result);
        },
        onError: (error: Error) => {
            props.onError(error.message);
        },
    });
}
