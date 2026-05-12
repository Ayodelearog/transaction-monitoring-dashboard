"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  trend?: number;
  helper?: string;
  icon: React.ReactNode;
  tone?: "primary" | "danger" | "success" | "info";
  loading?: boolean;
  index?: number;
}

const toneClasses = {
  primary: "bg-primary/10 text-primary",
  danger: "bg-danger/10 text-danger",
  success: "bg-success/10 text-success",
  info: "bg-info/10 text-info",
};

export function KpiCard({
  label,
  value,
  trend,
  helper,
  icon,
  tone = "primary",
  loading,
  index = 0,
}: KpiCardProps) {
  const trendPositive = (trend ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
    >
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            {loading ? (
              <Skeleton className="h-7 w-28" />
            ) : (
              <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                {value}
              </p>
            )}
            {!loading && (helper || typeof trend === "number") && (
              <div className="flex items-center gap-2 text-xs">
                {typeof trend === "number" && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                      trendPositive
                        ? "bg-success/10 text-success"
                        : "bg-danger/10 text-danger",
                    )}
                  >
                    {trendPositive ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {Math.abs(trend).toFixed(1)}%
                  </span>
                )}
                {helper && (
                  <span className="text-muted-foreground truncate">{helper}</span>
                )}
              </div>
            )}
          </div>
          <span
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-xl shrink-0",
              toneClasses[tone],
            )}
          >
            {icon}
          </span>
        </div>
      </Card>
    </motion.div>
  );
}
