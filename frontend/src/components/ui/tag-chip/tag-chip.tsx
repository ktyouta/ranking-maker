import { cn } from "@/utils/cn";
import { HiCheck, HiXMark } from "react-icons/hi2";

type PropsType = {
    /** タグ名 */
    label: string;
    /** 指定時はチップ全体を押せるボタンにする */
    onClick?: () => void;
    /** onClick 指定時の選択状態 */
    isSelected?: boolean;
    /** 指定時は外すための「×」ボタンを表示する */
    onRemove?: () => void;
};

const baseClassName = "inline-flex max-w-full items-center gap-1 rounded-full border-2 border-accent bg-surface px-3 py-1 text-sm sm:text-base font-medium text-ink/80";

/**
 * タグのチップ表示
 */
export function TagChip({ label, onClick, isSelected = false, onRemove }: PropsType) {
    if (onClick) {
        return (
            <button
                type="button"
                onClick={onClick}
                aria-pressed={isSelected}
                className={cn(baseClassName, "transition-colors", "hover:bg-canvas")}
            >
                {isSelected && <HiCheck className="size-4 shrink-0 text-accent" />}
                <span className="truncate">{label}</span>
            </button>
        );
    }

    return (
        <span className={baseClassName}>
            <span className="truncate">{label}</span>
            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="-mr-1 shrink-0 rounded-full p-0.5 text-ink-sub hover:bg-canvas hover:text-ink"
                    aria-label={`${label}を外す`}
                >
                    <HiXMark className="size-4" />
                </button>
            )}
        </span>
    );
}
