import { cn } from "@/utils/cn";
import { type ReactNode, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

type Size = "small" | "medium" | "large";
type HeaderVariant = "default" | "accent";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    title?: string;
    size?: Size;
    headerVariant?: HeaderVariant;
    closeOnOverlayClick?: boolean;
    closeOnEscape?: boolean;
};

const sizeClasses: Record<Size, string> = {
    small: "max-w-sm",
    medium: "max-w-md",
    large: "max-w-lg",
};

export function Dialog({
    isOpen,
    onClose,
    children,
    title,
    size = "medium",
    headerVariant = "default",
    closeOnOverlayClick = true,
    closeOnEscape = true,
}: Props) {
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (closeOnEscape && event.key === "Escape") {
                onClose();
            }
        },
        [closeOnEscape, onClose]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) {
        return null;
    }

    const handleOverlayClick = () => {
        if (closeOnOverlayClick) {
            onClose();
        }
    };

    const handleContentClick = (event: React.MouseEvent) => {
        event.stopPropagation();
    };

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "dialog-title" : undefined}
        >
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={handleOverlayClick}
                aria-hidden="true"
            />

            {/* Dialog Content */}
            <div
                className={cn(
                    "relative z-10 w-full mx-4 overflow-hidden bg-surface rounded-lg shadow-xl",
                    sizeClasses[size]
                )}
                onClick={handleContentClick}
            >
                {/* Header */}
                {title && (
                    <div
                        className={cn(
                            "flex items-center justify-between px-4 py-3 rounded-t-lg border-b border-ink/10",
                            headerVariant === "accent" && "bg-modal-header/20"
                        )}
                    >
                        <h2
                            id="dialog-title"
                            className="text-lg font-semibold text-ink"
                        >
                            {title}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1 text-ink-sub hover:text-ink rounded-full hover:bg-canvas"
                            aria-label="閉じる"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="p-4">{children}</div>
            </div>
        </div>,
        document.body
    );
}
