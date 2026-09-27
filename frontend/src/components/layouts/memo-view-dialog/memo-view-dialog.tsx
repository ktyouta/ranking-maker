import { Dialog } from '@/components';

type PropsType = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    memo: string;
};

/**
 * メモ表示ダイアログ
 */
export function MemoViewDialog(props: PropsType) {
    const { isOpen, onClose, title, memo } = props;

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="large"
        >
            <p className="min-h-[14rem] whitespace-pre-wrap break-words text-base text-ink">
                {memo || 'メモはありません'}
            </p>
        </Dialog>
    );
}
