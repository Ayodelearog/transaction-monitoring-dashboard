"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, leading, trailing, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border bg-surface px-3 transition-colors",
          "focus-within:ring-2 focus-within:ring-ring/30 focus-within:border-ring",
          invalid
            ? "border-danger focus-within:ring-danger/30 focus-within:border-danger"
            : "border-input",
          className,
        )}
      >
        {leading && <span className="text-muted-foreground">{leading}</span>}
        <input
          ref={ref}
          className="flex-1 bg-transparent py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        {trailing && <span className="text-muted-foreground">{trailing}</span>}
      </div>
    );
  },
);
Input.displayName = "Input";
