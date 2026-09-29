import { Dialog, TagChip, Textbox } from '@/components';
import type { KeyboardEvent } from 'react';

type PropsType = {
    isOpen: boolean;
    onClose: () => void;
    selectedTags: string[];
    maxTagCount: number;
    candidateTags: string[];
    tagInput: string;
    onChangeTagInput: (value: string) => void;
    onKeyDownTagInput: (event: KeyboardEvent<HTMLInputElement>) => void;
    onAddTag: () => void;
    onToggleTag: (tagName: string) => void;
    onRemoveTag: (tagName: string) => void;
    errMessage: string;
};

/**
 * タグ設定ダイアログ
 */
export function TagSelectDialog(props: PropsType) {
    const {
        isOpen,
        onClose,
        selectedTags,
        maxTagCount,
        candidateTags,
        tagInput,
        onChangeTagInput,
        onKeyDownTagInput,
        onAddTag,
        onToggleTag,
        onRemoveTag,
        errMessage,
    } = props;

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title="タグを設定"
            size="large"
            contentClassName="sm:max-w-2xl"
        >
            <div className="flex min-h-[26rem] flex-col gap-8 sm:min-h-[30rem]">
                <div>
                    <p className="mb-3 sm:mb-4 text-base font-semibold text-ink-sub">
                        設定中のタグ（{selectedTags.length}/{maxTagCount}）
                    </p>
                    {selectedTags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {selectedTags.map((tagName) => (
                                <TagChip
                                    key={tagName}
                                    label={tagName}
                                    onRemove={() => onRemoveTag(tagName)}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-base text-ink-sub">タグが設定されていません</p>
                    )}
                </div>
                <div>
                    <div className="flex gap-2">
                        <Textbox
                            className="h-11 min-w-0 flex-1 rounded-lg border-2 border-accent/50 px-3 focus:border-accent focus:ring-0"
                            placeholder="新しいタグを入力"
                            value={tagInput}
                            onChange={(e) => onChangeTagInput(e.target.value)}
                            onKeyDown={onKeyDownTagInput}
                        />
                        <button
                            type="button"
                            className="shrink-0 rounded-full bg-accent-surface px-5 text-sm sm:text-base font-medium text-white hover:bg-accent-surface-hover"
                            onClick={onAddTag}
                        >
                            追加
                        </button>
                    </div>
                    {errMessage && (
                        <p className="mt-2 text-base text-red-500">{errMessage}</p>
                    )}
                </div>
                <div>
                    <p className="mb-3 sm:mb-4 text-base font-semibold text-ink-sub">
                        これまでに使ったタグ
                    </p>
                    {candidateTags.length > 0 ? (
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
                        <p className="text-base text-ink-sub">まだタグはありません</p>
                    )}
                </div>
                <div className="mt-auto flex justify-end pt-2">
                    <button
                        type="button"
                        className="rounded-full border-2 border-accent/30 bg-surface px-5 py-2 text-sm sm:px-6 sm:text-base font-medium text-ink-sub hover:bg-canvas"
                        onClick={onClose}
                    >
                        閉じる
                    </button>
                </div>
            </div>
        </Dialog>
    );
}
