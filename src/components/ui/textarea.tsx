"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-lg border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors outline-none resize-y",
        "focus:ring-2 focus:ring-ring/30 focus:border-ring",
        invalid ? "border-danger focus:ring-danger/30 focus:border-danger" : "border-input",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
