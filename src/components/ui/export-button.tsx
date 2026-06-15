"use client";

import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExportButtonProps {
  dataset: "transactions" | "alerts" | "customers";
  params?: Record<string, string | undefined>;
  label?: string;
  className?: string;
}

/** Anchor styled as a button that downloads a server-generated CSV. */
export function ExportButton({
  dataset,
  params = {},
  label = "Export CSV",
  className,
}: ExportButtonProps) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && value !== "all") search.set(key, value);
  }
  const qs = search.toString();
  const href = `/api/export/${dataset}${qs ? `?${qs}` : ""}`;

  return (
    <a
      href={href}
      download
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
        className,
      )}
    >
      <Download className="h-3.5 w-3.5" />
      {label}
    </a>
  );
}
