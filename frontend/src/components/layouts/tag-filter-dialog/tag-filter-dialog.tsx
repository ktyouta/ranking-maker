import { Dialog, Spinner, TagChip } from '@/components';

type PropsType = {
    isOpen: boolean;
    onClose: () => void;
    isLoading: boolean;
    isError: boolean;
    candidateTags: string[];
    selectedTags: string[];
    maxTagCount: number;
    onToggleTag: (tagName: string) => void;
    errMessage: string;
};

/**
 * 検索用のタグ選択ダイアログ
 */
export function TagFilterDialog(props: PropsType) {
    const {
        isOpen,
        onClose,
        isLoading,
        isError,
        candidateTags,
        selectedTags,
        maxTagCount,
        onToggleTag,
        errMessage,
    } = props;

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title="タグで絞り込み"
            size="large"
            contentClassName="sm:max-w-2xl"
        >
            <div className="flex min-h-[20rem] flex-col gap-8 sm:min-h-[24rem]">
                <div>
                    <p className="mb-3 sm:mb-4 text-base font-semibold text-ink-sub">
                        選択中（{selectedTags.length}/{maxTagCount}）
                    </p>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Spinner className="size-8" />
                        </div>
                    ) : isError ? (
                        <p className="text-base text-red-500">タグの取得に失敗しました</p>
                    ) : candidateTags.length > 0 ? (
                        <div className="flex max-h-72 flex-wrap gap-2 overflow-y-auto">
                            {candidateTags.map((tagName) => (
                                <TagChip
                                    key={tagName}
                                    label={tagName}
                                    onClick={() => onToggleTag(tagName)}
                                    isSelected={selectedTags.includes(tagName)}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-base text-ink-sub">タグはありません</p>
                    )}
                    {errMessage && (
                        <p className="mt-2 text-base text-red-500">{errMessage}</p>
                    )}
                </div>
                <div className="mt-auto flex justify-end pt-2">
                    <button
                        type="button"
                        className="rounded-full border-2 border-accent/30 bg-surface px-6 py-2 text-base font-medium text-ink-sub hover:bg-canvas"
                        onClick={onClose}
                    >
                        閉じる
                    </button>
                </div>
            </div>
        </Dialog>
    );
}
