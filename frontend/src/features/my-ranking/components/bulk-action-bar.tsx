import { Button, Checkbox } from '@/components';
import { HiOutlineDocumentArrowDown } from 'react-icons/hi2';

type PropsType = {
    isSelectionMode: boolean;
    selectedCount: number;
    isAllSelectedOnPage: boolean;
    isExporting: boolean;
    onToggleSelectionMode: () => void;
    onToggleSelectAllOnPage: () => void;
    onExportCsv: () => void;
};

/**
 * マイランキング一覧の一括操作バー（選択モード切替・現在ページ全選択・CSV出力）
 */
export const BulkActionBar = (props: PropsType) => {

    const {
        isSelectionMode,
        selectedCount,
        isAllSelectedOnPage,
        isExporting,
        onToggleSelectionMode,
        onToggleSelectAllOnPage,
        onExportCsv,
    } = props;

    if (!isSelectionMode) {
        return null;
    }

    return (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/35 bg-surface px-4 py-3 sm:mb-6 sm:px-6">
            <p className="text-sm font-semibold text-accent sm:text-base">
                {selectedCount}件選択中
            </p>
            <div className="flex flex-wrap items-center gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-accent sm:text-base">
                    <Checkbox
                        checked={isAllSelectedOnPage}
                        onChange={onToggleSelectAllOnPage}
                        size="medium"
                    />
                    このページを全選択
                </label>
                <Button
                    colorType="accent"
                    sizeType="medium"
                    onClick={onToggleSelectionMode}
                    className="rounded-full bg-white px-5 py-2 text-sm text-accent shadow-none ring-1 ring-inset ring-accent/40 hover:bg-canvas sm:text-base"
                >
                    キャンセル
                </Button>
                <Button
                    colorType="accent"
                    sizeType="medium"
                    onClick={onExportCsv}
                    disabled={selectedCount === 0 || isExporting}
                    className="flex items-center gap-1.5 rounded-full px-5 py-2 text-sm shadow-md disabled:opacity-50 sm:text-base"
                >
                    <HiOutlineDocumentArrowDown className="size-4" />
                    {isExporting ? '出力中...' : 'CSV出力'}
                </Button>
            </div>
        </div>
    );
};
