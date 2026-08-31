import { Dialog } from '@/components';
import { HiCheck } from 'react-icons/hi2';
import { ThemeType } from './theme-provider';

type PropsType = {
    isOpen: boolean;
    onClose: () => void;
    theme: ThemeType;
    onSelect: (theme: ThemeType) => void;
};

const THEME_OPTIONS: { value: ThemeType; label: string; swatchClassName: string }[] = [
    { value: 'lavender', label: 'ラベンダー', swatchClassName: 'bg-[#7C6FE0]' },
    { value: 'teal', label: 'ティール', swatchClassName: 'bg-[#0F9E93]' },
    { value: 'peach', label: 'ピーチ', swatchClassName: 'bg-[#E8663D]' },
    { value: 'dark', label: 'ダークモード', swatchClassName: 'bg-[#0B1716]' },
];

/**
 * テーマ選択ダイアログ。選択と同時に即反映する（保存操作は不要）
 */
export function ThemeSelectDialog(props: PropsType) {

    return (
        <Dialog
            isOpen={props.isOpen}
            onClose={props.onClose}
            title="テーマ設定"
            size="small"
        >
            <div className="flex flex-col gap-2">
                {THEME_OPTIONS.map((option) => {
                    const isSelected = option.value === props.theme;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => props.onSelect(option.value)}
                            className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-colors ${isSelected ? 'border-accent bg-canvas' : 'border-line hover:bg-canvas'
                                }`}
                        >
                            <span className={`size-6 shrink-0 rounded-full ${option.swatchClassName}`} />
                            <span className="flex-1 text-base font-medium text-ink">
                                {option.label}
                            </span>
                            {isSelected && <HiCheck className="size-5 shrink-0 text-accent" />}
                        </button>
                    );
                })}
            </div>
        </Dialog>
    );
}
