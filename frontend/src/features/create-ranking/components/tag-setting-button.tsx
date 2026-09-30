import { HiOutlineTag } from 'react-icons/hi2';

type PropsType = {
    selectedTagCount: number;
    openTagDialog: () => void;
    className?: string;
};

/**
 * タグ設定ダイアログを開くボタン（選択中のタグ数をバッジ表示）
 */
export function TagSettingButton(props: PropsType) {

    const {
        selectedTagCount,
        openTagDialog,
        className,
    } = props;

    return (
        <button
            type="button"
            onClick={openTagDialog}
            className={`relative shrink-0 rounded-full bg-accent/15 p-2 text-accent hover:bg-accent/25 ${className ?? ''}`}
            aria-label="タグを設定"
        >
            <HiOutlineTag className="size-6" />
            {selectedTagCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-surface px-1 text-xs font-bold text-white">
                    {selectedTagCount}
                </span>
            )}
        </button>
    );
}
