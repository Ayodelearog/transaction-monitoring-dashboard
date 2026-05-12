"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveIndicatorProps {
  isFetching: boolean;
  lastUpdated?: number;
  className?: string;
}

export function LiveIndicator({ isFetching, lastUpdated, className }: LiveIndicatorProps) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  const seconds =
    lastUpdated && now ? Math.max(0, Math.round((now - lastUpdated) / 1000)) : null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-muted-foreground",
        className,
      )}
    >
      <span className="relative inline-flex h-2 w-2">
        <motion.span
          className="absolute inset-0 rounded-full bg-success"
          animate={
            isFetching
              ? { scale: [1, 1.6, 1], opacity: [0.7, 0, 0.7] }
              : { scale: 1, opacity: 1 }
          }
          transition={{ duration: 1.2, repeat: isFetching ? Infinity : 0 }}
        />
        <span className="relative h-2 w-2 rounded-full bg-success" />
      </span>
      <Activity className="h-3 w-3" />
      {isFetching
        ? "Syncing live data…"
        : seconds !== null
          ? `Updated ${seconds}s ago`
          : "Live"}
    </div>
  );
}
