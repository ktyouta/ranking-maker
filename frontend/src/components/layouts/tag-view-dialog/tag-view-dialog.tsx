import { Dialog, TagChip } from '@/components';

type PropsType = {
    isOpen: boolean;
    onClose: () => void;
    tags: string[];
};

/**
 * タグ表示ダイアログ
 */
export function TagViewDialog(props: PropsType) {
    const { isOpen, onClose, tags } = props;

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title="タグ"
            size="large"
        >
            <div className="min-h-[14rem]">
                {tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tagName) => (
                            <TagChip key={tagName} label={tagName} />
                        ))}
                    </div>
                ) : (
                    <p className="text-base text-ink">タグはありません</p>
                )}
            </div>
        </Dialog>
    );
}
