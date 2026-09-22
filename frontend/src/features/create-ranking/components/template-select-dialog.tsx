import { Dialog, Spinner } from '@/components';
import { Suspense } from 'react';
import { TemplateRankingListContainer } from './template-ranking-list-container';

type PropsType = {
    isOpen: boolean;
    onClose: () => void;
    onSelectRanking: (rankingId: string) => void;
};

/**
 * テンプレート選択ダイアログ
 */
export function TemplateSelectDialog(props: PropsType) {

    const { isOpen, onClose, onSelectRanking } = props;

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title="テンプレートから作成"
            size="medium"
            contentClassName="sm:max-w-2xl"
        >
            <div className="min-h-[40vh] max-h-[70vh] overflow-y-auto pr-3">
                <Suspense
                    fallback={
                        <div className="flex items-center justify-center py-12">
                            <Spinner className="size-8" />
                        </div>
                    }
                >
                    <TemplateRankingListContainer onSelectRanking={onSelectRanking} />
                </Suspense>
            </div>
        </Dialog>
    );
}
