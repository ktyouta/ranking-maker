import * as React from "react";
import { type ComponentPropsWithoutRef } from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "@/utils/cn";

type Props = {
    registration?: Partial<UseFormRegisterReturn>;
} & Omit<ComponentPropsWithoutRef<"textarea">, "ref">;

export const Textarea = React.forwardRef<HTMLTextAreaElement, Props>(
    ({ registration, className, ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                {...registration}
                {...props}
                className={cn(
                    "border border-gray-300 rounded px-3 py-2 text-base resize-y min-h-[80px]",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    className
                )}
            />
        );
    }
);

Textarea.displayName = "Textarea";
