"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, ...props }, ref) => (
    <div
      className={cn(
        "relative flex items-center rounded-lg border border-input bg-surface px-3 transition-colors",
        "focus-within:ring-2 focus-within:ring-ring/30 focus-within:border-ring",
        className,
      )}
    >
      <select
        ref={ref}
        className="w-full appearance-none bg-transparent py-2.5 pr-7 text-sm text-foreground outline-none cursor-pointer"
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-muted-foreground" />
    </div>
  ),
);
Select.displayName = "Select";
