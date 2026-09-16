import { Button, Checkbox } from '@/components';
import { HiOutlineDocumentArrowDown, HiOutlineTrash } from 'react-icons/hi2';

type PropsType = {
    isSelectionMode: boolean;
    selectedCount: number;
    isAllSelectedOnPage: boolean;
    isExporting: boolean;
    isDeleting: boolean;
    onToggleSelectionMode: () => void;
    onToggleSelectAllOnPage: () => void;
    onExportCsv: () => void;
    onClickBulkDelete: () => void;
};

/**
 * マイランキング一覧の一括操作バー（選択モード切替・現在ページ全選択・CSV出力・一括削除）
 */
export const BulkActionBar = (props: PropsType) => {

    const {
        isSelectionMode,
        selectedCount,
        isAllSelectedOnPage,
        isExporting,
        isDeleting,
        onToggleSelectionMode,
        onToggleSelectAllOnPage,
        onExportCsv,
        onClickBulkDelete,
    } = props;

    if (!isSelectionMode) {
        return null;
    }

    return (
        <div className="mb-3 flex flex-col gap-4 rounded-2xl border border-accent/35 bg-surface px-4 py-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-3">
            <div className="flex items-center justify-between gap-3 sm:justify-start sm:gap-6">
                <p className="text-sm font-semibold text-accent sm:text-base">
                    {selectedCount}件選択中
                </p>
                <div className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-accent sm:text-base">
                    <Checkbox
                        id="all-check-page-id"
                        checked={isAllSelectedOnPage}
                        onChange={onToggleSelectAllOnPage}
                        size="medium"
                    />
                    <label htmlFor="all-check-page-id">
                        このページを全選択
                    </label>
                </div>
            </div>
            <div className="flex items-center gap-2 sm:flex-wrap sm:gap-4">
                <Button
                    colorType="accent"
                    sizeType="medium"
                    onClick={onToggleSelectionMode}
                    className="flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm text-accent shadow-none ring-1 ring-inset ring-accent/40 hover:bg-canvas sm:text-base"
                >
                    キャンセル
                </Button>
                <Button
                    colorType="accent"
                    sizeType="medium"
                    onClick={onExportCsv}
                    disabled={selectedCount === 0 || isExporting}
                    className="hidden items-center justify-center gap-1.5 rounded-full font-semibold px-5 py-2 text-sm shadow-md disabled:opacity-50 sm:text-base lg:flex"
                >
                    <HiOutlineDocumentArrowDown className="size-4" />
                    {isExporting ? '出力中...' : 'CSV出力'}
                </Button>
                <Button
                    colorType="accent"
                    sizeType="medium"
                    onClick={onClickBulkDelete}
                    disabled={selectedCount === 0 || isDeleting}
                    className="flex items-center justify-center gap-1.5 rounded-full font-semibold bg-danger-fill px-5 py-2 text-sm shadow-md hover:bg-danger-fill-hover disabled:opacity-50 sm:text-base"
                >
                    <HiOutlineTrash className="size-4" />
                    {isDeleting ? '削除中...' : '削除'}
                </Button>
            </div>
        </div>
    );
};
