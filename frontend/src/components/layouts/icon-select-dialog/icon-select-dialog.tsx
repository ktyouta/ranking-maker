import { Dialog } from '@/components';
import { HiCheck } from 'react-icons/hi2';

type IconOption = {
    id: number;
    emoji: string;
};

type PropsType = {
    isOpen: boolean;
    onClose: () => void;
    icons: IconOption[];
    selectedIconId: number;
    onSelect: (iconId: number) => void;
};

/**
 * アイコン選択ダイアログ
 */
export function IconSelectDialog(props: PropsType) {

    const { isOpen, onClose, icons, selectedIconId, onSelect } = props;

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title="アイコンを選択"
            size="medium"
            contentClassName="sm:max-w-3xl"
        >
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
                {icons.map((icon) => {
                    const isSelected = icon.id === selectedIconId;
                    return (
                        <button
                            key={icon.id}
                            type="button"
                            onClick={() => onSelect(icon.id)}
                            className={`relative flex aspect-square items-center justify-center rounded-lg border-2 text-2xl transition-colors ${isSelected ? 'border-accent bg-canvas' : 'border-line hover:bg-canvas'
                                }`}
                        >
                            {icon.emoji}
                            {isSelected && (
                                <HiCheck className="absolute -right-1 -top-1 size-4 shrink-0 rounded-full bg-accent p-0.5 text-white" />
                            )}
                        </button>
                    );
                })}
            </div>
        </Dialog>
    );
}
